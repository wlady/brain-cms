<?php

namespace Bump\Serializer;

class Igbinary extends Serializer
{
    /**
     * @codeCoverageIgnore
     */
    public function __construct()
    {
        if (!extension_loaded('igbinary')) {
            throw new \Exception(__CLASS__ . ' requires PECL igbinary extension to be loaded.');
        }
    }

    protected function setValue($data)
    {
        return igbinary_serialize($data);
    }

    protected function getValue($data)
    {
        return igbinary_unserialize($data);
    }
}
