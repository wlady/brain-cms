<?php

namespace Bump\Modules\Users;

use Bump\Core\CMS;

class Users extends \Bump\Core\Module
{
    protected $user = null;

    public function init()
    {
        $this->view_model = new Model\View();
        $this->model = new Model\User();
    }

    public function getRows()
    {
        $args = func_get_arg(0);
        $filter = [
            [
                'field' => 'user_level',
                'data' => [
                    'type' => 'numeric',
                    'comparison' => 'le',
                    'value' => CMS::User()->getUserLevel()
                ]
            ]
        ];
        $args['_filter'] = json_encode($filter);
        return parent::getRows($args);
    }

    protected function _postGetRow(&$row)
    {
        unset($row['user_password']);
    }

    protected function _postGetRows(&$rows)
    {
        $sql = "SELECT m.m_path,m.m_id FROM cms_modules m INNER JOIN cms_users_modules um ON (m.m_id=um.module_id) WHERE um.id=?";
        foreach ($rows as &$row) {
            unset($row['user_password']);
            $res = [];
            if ($mods = $this->db->GetAssoc($sql, $row['user_id'])) {
                $res = $mods;
            }
            $row['user_modules'] = json_encode($res);
        }
    }

    protected function _preSaveRow(&$fields)
    {
        $config = CMS::Config();
        if (($type = array_search($fields['user_type'], $config->authProviders->providers)) === false) {
            throw new \Exception(CMS::Labels()->unknown_user_type);
        }
        $provider = '\\Bump\\Auth\\' . $config->authProviders->providers[$type];
        if (!class_exists($provider)) {
            throw new \Exception(CMS::Labels()->unknown_user_type);
        }
        $module = new $provider;
        if (!$fields['user_id']) {
            if ($module::isSingle()) {
                // if single then try to find already registered user of this type
                $sql = "SELECT user_id FROM cms_users WHERE user_type=?";
                if ($this->db->GetOne($sql, $fields['user_type'])) {
                    throw new \Exception(CMS::Labels()->user_type_exists);
                }
            }
        }
        if ($module::isSingle()) {
            // unset login field for user of this type!
            unset($fields['user_login']);
        }
        $excluded = $module::getExcludedFields();
        foreach ($excluded as $field) {
            unset($fields[$field]);
        }
        $res = [];
        if (empty($fields['user_password'])) {
            unset($fields['user_password']);
        } else {
            $res['user_password'] = $fields['user_password'];
        }
        if (!$fields['user_id']) {
            $fields['user_registered'] = date('Y-m-d');
        }
        return $res;
    }

    protected function _postSaveRow($fields, $odds)
    {
        if ($fields['__lastInsertID__']) {
            $fields['user_id'] = $fields['__lastInsertID__'];
        }
        if ($odds['user_password']) {
            $sql = "UPDATE cms_users SET user_password= ? WHERE user_id=?";
            $this->db->Execute($sql,
                [
                    password_hash($odds['user_password'], PASSWORD_DEFAULT),
                    $fields['user_id']
                ]
            );
        }
        if ($fields['user_login']) {
            $fields['user_hash'] = md5($fields['user_login'] . $fields['user_type']);
            $this->saveProfile($fields);
        }
        $this->saveAllowedModules($fields['user_id']);
    }

    protected function saveProfile($fields)
    {
        $settings = [
            'user_theme' => $fields['user_theme'],
            'user_editor' => $fields['user_editor'],
            'user_layout' => $fields['user_layout'],
            'user_iconsize' => $fields['user_iconsize'],
            'user_debug' => $fields['user_debug']
        ];
        $profile = [
            'u_login' => $fields['user_login'],
            'u_type' => $fields['user_type'],
            'u_hash' => $fields['user_hash'],
            'u_settings' => serialize($settings)
        ];
        $this->db->Replace('cms_users_profiles', $profile, 'u_hash', true);
    }

    private function saveAllowedModules($user_id)
    {
        $assigned = $this->getReqVar('assigned', 'json');
        if (is_array($assigned)) {
            $sql = "DELETE FROM cms_users_modules WHERE id=?";
            $this->db->Execute($sql, $user_id);
            $sql = "INSERT IGNORE INTO cms_users_modules SET id=?, module_id=?";
            foreach ($assigned as $item) {
                if ($item[1]) {
                    $this->db->Execute($sql,
                        [
                            $user_id,
                            $item[0]
                        ]
                    );
                }
            }
        }
    }

    public function authenticateUser()
    {
        $args = func_get_arg(0);
        $login = $this->getReqVar("login", "text", $args);
        $password = $this->getReqVar("password", "text", $args);
        $res = false;
        // get default settings
        $sql = "
			SELECT
				u.user_id,
				u.user_login,
				u.user_type,
				u.user_name,
				u.user_password,
				u.user_email,
				u.user_theme,
				u.user_editor,
				u.user_layout,
				u.user_iconsize,
				u.user_debug,
				u.user_customizable,
				u.user_active,
				ug.user_group,
				ug.user_level
			FROM cms_users u
			LEFT JOIN cms_users_groups ug
			ON u.ug_id=ug.group_id
            WHERE user_login=?  AND user_type='Users' AND user_active='true'";

        if ($row = $this->db->GetRow($sql, [$login])) {
            if (!password_verify($password, $row['user_password'])) {
                return $res;
            }
            unset($row['user_password']);

            $res = $row;
            // get personal settings
            $sql = "SELECT u_settings FROM cms_users_profiles WHERE u_login=? AND u_type='Users'";
            if ($u_profile = $this->db->GetOne($sql, $login)) {
                $u_profile = unserialize($u_profile);
                $res = array_merge($res, $u_profile);
            } else {
                // if not yet set - create new user profile
                $res['user_hash'] = md5($res['user_login'] . $res['user_type']);
                $this->saveProfile($res);
            }
        }
        return $res;
    }
}
