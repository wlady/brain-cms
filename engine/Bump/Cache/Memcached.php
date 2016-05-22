<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class Memcached extends Cache
{

    protected static $hosts = ['127.0.0.1'];
    protected static $port = 11211;
    protected static $compress = true;
    protected static $memcached = null;

    public function __construct($hosts = ['127.0.0.1'], $port = 11211, $compress = true)
    {
        self::$hosts = $hosts;
        self::$port = $port;
        self::$compress = $compress;
        $this->initialize();
    }

    public function initialize()
    {
        parent::initialize();
        if (!extension_loaded('memcached')) {
            throw new \Exception(__CLASS__ . ' requires PECL memcached extension to be loaded.');
        }
        self::$memcached = new \Memcached;
        self::$memcached->setOption(\Memcached::OPT_COMPRESSION, self::$compress);
        foreach (self::$hosts as $host) {
            self::$memcached->addServer($host, self::$port);
        }
    }

    protected function getValue($key)
    {
        return self::$memcached->get($key);
    }

    protected function setValue($key, $value, $expire)
    {
        return self::$memcached->set($key, $value, $expire);
    }

    protected function addValue($key, $value, $expire)
    {
        return self::$memcached->add($key, $value, $expire);
    }

    protected function deleteValue($key)
    {
        return self::$memcached->delete($key);
    }

    public function flush()
    {
        return self::$memcached->flush();
    }
}
