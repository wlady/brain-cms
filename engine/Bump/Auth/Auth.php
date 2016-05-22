<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Auth;

/**
 * @codeCoverageIgnore
 */
abstract class Auth
{
    protected static $isSingle = null;
    protected static $excluded = []; // do not save these fields
    protected static $title = '';

    abstract public function auth();

    public static function getTitle()
    {
        return self::$title;
    }

    public static function isSingle()
    {
        return self::$isSingle;
    }

    public static function getExcludedFields()
    {
        return self::$excluded;
    }
}
