<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class EAccelerator extends Cache
{

    public function __construct()
    {
        $this->initialize();
    }

    public function initialize()
    {
        parent::initialize();
        if (!function_exists('eaccelerator_get')) {
            throw new \Exception(__CLASS__ . ' requires PHP eAccelerator extension to be loaded and eaccelerator_get function enabled.');
        }
    }

    protected function getValue($key)
    {
        $result = eaccelerator_get($key);
        return $result !== null ? $result : false;
    }

    protected function setValue($key, $value, $expire)
    {
        return eaccelerator_put($key, $value, $expire);
    }

    protected function addValue($key, $value, $expire)
    {
        return eaccelerator_get($key) === null ? $this->setValue($key, $value, $expire) : false;
    }

    protected function deleteValue($key)
    {
        return eaccelerator_rm($key);
    }

    public function flush()
    {
        // first, remove expired content from cache
        eaccelerator_gc();
        // now, remove leftover cache-keys
        $keys = eaccelerator_list_keys();
        foreach ($keys as $key) {
            $this->deleteValue(substr($key['name'], 1));
        }
    }
}
