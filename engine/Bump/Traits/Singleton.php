<?php
/**
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 *
 */
namespace Bump\Traits;

trait Singleton
{

    protected static $instance = null;

    final public static function getInstance()
    {
        return isset(static::$instance)
            ? static::$instance
            : static::$instance = new static(func_get_args() ? func_get_arg(0) : null);
    }

    private function __construct()
    {
        $this->init(func_get_args() ? func_get_arg(0) : null);
    }

    protected function init()
    {
    }
}
