<?php

namespace Bump\Modules\Profile;

use Bump\Core\CMS;

class Profile extends \Bump\Modules\Users\Users
{

    public function __construct()
    {
        parent::__construct();
    }

    // wrapper to getRow (!!!)
    public function getProfile()
    {
        $row = (array)CMS::User()->getUserProfile();
        if (self::isAjax()) {
            if ($this->getReqVar('metadata', 'int')) {
                return [
                    'metaData' => $this->getFieldsMeta(),
                    'results' => 1,
                    'rows' => [$row],
                    'success' => true
                ];
            } else {
                return [
                    'data' => $row,
                    'success' => true
                ];
            }
        } else {
            return $row;
        }
    }

    protected function _preSaveRow(&$fields)
    {
        $config = CMS::Config();
        if (($type = array_search($fields['user_type'],
                $config->authProviders->providers)) === false
        ) {
            throw new \Exception(CMS::Labels()->unknown_user_type);
        }
        $module = '\\Bump\\Auth\\' . $config->authProviders->providers[$type];
        if (!class_exists($module)) {
            throw new \Exception(CMS::Labels()->unknown_user_type);
        }
        $module = new $module();
        $res = [];
        if (empty($fields['user_password'])) {
            unset($fields['user_password']);
        } else {
            $res['user_password'] = $fields['user_password'];
        }
        // this param is not in field list
        $current_user = $this->getReqVar("current_user", "text");
        if ($current_user) {
            // save personal profile (see parent class)
            $fields['user_hash'] = md5($current_user . $fields['user_type']);
            $fields['user_login'] = $current_user;
            $this->saveProfile($fields);
            unset($fields['user_hash']);
        }
        if ($module::isSingle()) {
            // unset login field for user of this type!
            unset($fields['user_login']);
        }
        $session = CMS::Session();
        $user = $session->getItem("cmsuser");
        $user->user_email = $fields['user_email'];
        $user->user_theme = $fields['user_theme'];
        $user->user_editor = $fields['user_editor'];
        $user->user_layout = $fields['user_layout'];
        $user->user_iconsize = $fields['user_iconsize'];
        $user->user_debug = $fields['user_debug'];
        $session->setItem("cmsuser", $user);
        // remove user level if exists
        unset($fields['ul_id']);
        // and all profile variables
        unset($fields['user_theme']);
        unset($fields['user_editor']);
        unset($fields['user_layout']);
        unset($fields['user_iconsize']);
        unset($fields['user_debug']);
        return $res;
    }

    protected function _postSaveRow($fields, $odds)
    {
        if (array_key_exists('user_password', $odds) && !empty($odds['user_password']) && $fields['user_login']) {
            $sql = "UPDATE cms_users SET user_password= ? WHERE user_id = ?";
            $this->db->Execute($sql, [
                password_hash($odds['user_password'], PASSWORD_DEFAULT),
                $fields['user_id']
            ]);
        }
    }
}
