<?php

namespace Bump\Auth;

abstract class ExternalAuth extends Auth
{
    use \Bump\Traits\AdoDB, \Bump\Traits\Context;

    public function __construct()
    {
        $this->connect();
        self::$isSingle = true;
        self::$excluded = [
            'user_login',
            'user_password',
            'user_email',
        ];
    }

    public function getAuthUser()
    {
        $type = $this->getShortClass();
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

        return $this->db->GetRow($sql, $type);
    }

    /**
     * @param $email
     * @param $login
     * @param $fullName
     * @param $token
     * @return array
     * @codeCoverageIgnoreStart
     */
    protected function prepareProfile($email, $login, $fullName, $token = '')
    {
        // get default settings
        $profile = $this->getAuthUser();

        if (empty($profile)) {
            return false;
        }

        $profile['user_active'] = 'true';
        $profile['user_email'] = $email ? $email : $login;
        $profile['user_group'] = $profile['user_name'];
        $profile['user_name'] = $fullName ? $fullName : $login;
        $profile['user_login'] = $login;
        $profile['user_token'] = $token;

        // get personal settings
        $sql = 'SELECT u_settings FROM cms_users_profiles WHERE u_login=? AND u_type=?';
        $shortClass = $this->getShortClass();
        if ($u_profile = $this->db->GetOne($sql, [$login, $shortClass])) {
            $u_profile = unserialize($u_profile);
            $profile = array_merge($profile, $u_profile);
            return $profile;
        }
        return false;
    }
    // @codeCoverageIgnoreEnd

    /**
     * @return string
     */
    protected function getShortClass()
    {
        return substr(get_class($this), 1 + strrpos(get_class($this), '\\'));
    }
}
