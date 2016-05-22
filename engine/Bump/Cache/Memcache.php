<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class Memcache extends Cache
{

    protected static $hosts = ['127.0.0.1'];
    protected static $port = 11211;
    protected static $compress = true;
    protected static $memcache = null;

    public function __construct($hosts = ['127.0.0.1'], $port = 11211, $compress = true)
    {
        self::$hosts = $hosts;
        self::$port = $port;
        self::$compress = $compress ? MEMCACHE_COMPRESSED : 0;
        $this->initialize();
    }

    public function initialize()
    {
        parent::initialize();
        if (!extension_loaded('memcache')) {
            throw new \Exception(__CLASS__ . ' requires PECL memcache extension to be loaded.');
        }
        self::$memcache = new \Memcache;
        foreach (self::$hosts as $host) {
            self::$memcache->addServer($host, self::$port);
        }
    }

    protected function getValue($key)
    {
        return self::$memcache->get($key);
    }

    protected function setValue($key, $value, $expire)
    {
        return self::$memcache->set($key, $value, self::$compress, $expire);
    }

    protected function addValue($key, $value, $expire)
    {
        return self::$memcache->add($key, $value, self::$compress, $expire);
    }

    protected function deleteValue($key)
    {
        return self::$memcache->delete($key);
    }

    public function flush()
    {
        return self::$memcache->flush();
    }
}
