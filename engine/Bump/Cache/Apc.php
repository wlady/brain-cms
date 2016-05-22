<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class Apc extends Cache
{

    public function __construct()
    {
        $this->initialize();
    }

    public function initialize()
    {
        parent::initialize();
        if (!extension_loaded('apc')) {
            throw new \Exception(__CLASS__ . ' requires PECL apc extension to be loaded.');
        }
    }

    protected function getValue($key)
    {
        return apc_fetch($key);
    }

    protected function getValues($keys)
    {
        return apc_fetch($keys);
    }

    protected function setValue($key, $value, $expire)
    {
        return apc_store($key, $value, $expire);
    }

    protected function addValue($key, $value, $expire)
    {
        return apc_add($key, $value, $expire);
    }

    protected function deleteValue($key)
    {
        return apc_delete($key);
    }

    public function flush()
    {
        return apc_clear_cache('user');
    }
}
