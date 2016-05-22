<?php
/**
 *
 * @author alext
 *
 * Facade class
 */

namespace Bump\Core;

class CMS
{
    /**
     * @return \Bump\Core\Request
     */
    public static function Request()
    {
        return Request::getInstance();
    }

    /**
     * @return \Bump\Core\User
     */
    public static function User()
    {
        return User::getInstance();
    }

    /**
     * @return \Bump\Core\Session
     */
    public static function Session()
    {
        return Session::getInstance();
    }

    /**
     * @return \Bump\Core\Labels
     */
    public static function Labels()
    {
        return Labels::getInstance();
    }

    /**
     * @return \Bump\Core\Configuration
     */
    public static function Config()
    {
        return Configuration::getInstance();
    }

    public static function getLang()
    {
        return User::getInstance()->getLang();
    }

}
