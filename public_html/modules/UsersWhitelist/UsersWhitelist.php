<?php

namespace Bump\Modules\UsersWhitelist;

class UsersWhitelist extends \Bump\Core\Module
{
    protected static $settings = [];

    public function init()
    {
        $this->model = new Model\UsersWhitelist();
    }

    protected function _preSaveRow(&$fields)
    {
        foreach ($fields as $key => $field) {
            if (!in_array($key, ['id', 'u_login', 'u_type'])) {
                unset($fields[$key]);
            }
        }

        if (!$fields['id']) {
            $sql = '
                SELECT
                    u.user_id,
                    u.user_login,
                    u.user_type,
                    u.user_name,
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
                WHERE user_type = ?';

            $profile = $this->db->GetRow($sql, $fields['u_type']);

            $settings = [
                'user_theme' => $profile['user_theme'],
                'user_editor' => $profile['user_editor'],
                'user_layout' => $profile['user_layout'],
                'user_iconsize' => $profile['user_iconsize'],
                'user_debug' => $profile['user_debug'],
            ];

            $fields['u_hash'] = md5($fields['u_login'] . $fields['u_type']);
            $fields['u_settings'] = serialize($settings);
        }
    }

}
