<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class YAML
{
    private static $file = null;
    private static $dir = null;
    private static $expire = null;

    public static function load($yaml_file, $dir, $expire = 86400)
    {
        self::$file = $yaml_file;
        self::$dir = $dir;
        self::$expire = $expire;
        // use file handler to cache data
        $cache = new \Bump\Cache\File();
        if (($result = $cache->get($yaml_file)) !== false) {
            return $result;
        }

        $fullPath = self::$dir . DIRECTORY_SEPARATOR . self::$file;
        $result = is_readable($fullPath) && file_exists($fullPath)
            ? \Spyc::YAMLLoad($fullPath)
            : [];

        $cache->set($yaml_file, $result);

        return $result;
    }

    public static function dump($array, $indent = false, $wordwrap = false)
    {
        return \Spyc::YAMLDump($array, $indent, $wordwrap);
    }
}
