<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

abstract class Cache implements ICache, \ArrayAccess
{

    public $keyPrefix = '';
    protected $serializer = false;

    public function initialize()
    {
        if ($this->keyPrefix === null) {
            $this->keyPrefix = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : $_SERVER['USER'];
        }
        if (defined('SERIALIZER') && SERIALIZER === 1) {
            $this->serializer = true;
        }
    }

    protected function generateUniqueKey($key)
    {
        return md5($this->keyPrefix . $key);
    }

    public function get($id)
    {
        if (($value = $this->getValue($this->generateUniqueKey($id))) !== false) {
            $data = null;
            if (is_string($value)) {
                if ($this->serializer) {
                    $data = igbinary_unserialize($value);
                } else {
                    $data = unserialize($value);
                }
            }
            if (!is_array($data)) {
                return false;
            }
            if (!($data[1] instanceof ICacheDependency) || !$data[1]->getHasChanged()) {
                return $data[0];
            }
        }

        return false;
    }

    public function mget($ids)
    {
        $uniqueIDs = array();
        $results = array();
        foreach ($ids as $id) {
            $uniqueIDs[$id] = $this->generateUniqueKey($id);
            $results[$id] = false;
        }
        $values = $this->getValues($uniqueIDs);
        foreach ($uniqueIDs as $id => $uniqueID) {
            if (!isset($values[$uniqueID])) {
                continue;
            }
            if ($this->serializer) {
                $data = igbinary_unserialize($values[$uniqueID]);
            } else {
                $data = unserialize($values[$uniqueID]);
            }
            if (is_array($data) && (!($data[1] instanceof ICacheDependency) || !$data[1]->getHasChanged())) {
                $results[$id] = $data[0];
            }
        }

        return $results;
    }

    public function set($id, $value, $expire = 0, $dependency = null)
    {
        if ($dependency !== null) {
            $dependency->evaluateDependency();
        }
        $data = array($value, $dependency);

        return $this->setValue(
            $this->generateUniqueKey($id),
            ($this->serializer ? igbinary_serialize($data) : serialize($data)),
            $expire
        );
    }

    public function add($id, $value, $expire = 0, $dependency = null)
    {
        if ($dependency !== null) {
            $dependency->evaluateDependency();
        }
        $data = array($value, $dependency);

        return $this->addValue(
            $this->generateUniqueKey($id),
            ($this->serializer ? igbinary_serialize($data) : serialize($data)),
            $expire
        );
    }

    public function delete($id)
    {
        return $this->deleteValue($this->generateUniqueKey($id));
    }

    public function flush()
    {
        return;
    }

    protected function getValue($key)
    {
        return;
    }

    protected function getValues($keys)
    {
        $results = array();
        foreach ($keys as $key) {
            $results[$key] = $this->getValue($key);
        }
        return $results;
    }

    protected function setValue($key, $value, $expire)
    {
        return;
    }

    protected function addValue($key, $value, $expire)
    {
        return;
    }

    protected function deleteValue($key)
    {
        return;
    }

    public function offsetExists($id)
    {
        return $this->get($id) !== false;
    }

    public function offsetGet($id)
    {
        return $this->get($id);
    }

    public function offsetSet($id, $value)
    {
        $this->set($id, $value);
    }

    public function offsetUnset($id)
    {
        $this->delete($id);
    }
}
