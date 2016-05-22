<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com and is used for tests.only
 *
 * Package Bump
 */
namespace Bump\Auth;

class Test extends Auth
{

    public function __construct()
    {
        self::$title = 'PHP Unit Test User';
        self::$isSingle = true;
        self::$excluded = [
            'user_login',
            'user_password',
            'user_email',
        ];
    }

    public function auth()
    {
        return false;
    }

}
