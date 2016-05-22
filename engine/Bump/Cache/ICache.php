<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

interface ICache
{
    public function get($id);

    public function mget($ids);

    public function set($id, $value, $expire = 0, $dependency = null);

    public function add($id, $value, $expire = 0, $dependency = null);

    public function delete($id);

    public function flush();
}
