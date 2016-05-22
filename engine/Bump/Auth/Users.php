<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Auth;

use \Bump\Core\CMS;

class Users extends Auth
{

    public function __construct()
    {
        self::$isSingle = false;
        self::$title = 'Local User';
        self::$excluded = [];
    }

    public function auth()
    {
        $result = false;
        $profile = call_user_func([new \Bump\Modules\Users\Users(), 'authenticateUser'], func_get_arg(0));
        if (is_array($profile)) {
            $result = true;
            CMS::Session()->setItem('auth_type', get_class());
            CMS::User()->registerUser($profile);
        }

        return $result;
    }

}
