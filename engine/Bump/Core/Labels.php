<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class Labels
{
    private static $instance = null;

    /**
     * @return Labels
     */
    public static function getInstance()
    {
        if (empty(self::$instance)) {
            self::setLang(\Bump\Core\CMS::getLang());
        }

        return self::$instance;
    }

    protected function __construct()
    {
        //singleton
    }

    public function getLabels()
    {
        return $this->labels;
    }

    public function __get($var)
    {
        if (isset($this->labels[$var])) {
            return $this->labels[$var];
        }
    }

    public static function setLang($lang)
    {
        $lang = '\\Bump\\Lang\\' . ucfirst($lang);

        if (!class_exists($lang)) {
            $lang = '\\Bump\\Lang\\En';
        }

        self::$instance = new $lang;
    }

    public static function clear()
    {
        return self::$instance = null;
    }
}
