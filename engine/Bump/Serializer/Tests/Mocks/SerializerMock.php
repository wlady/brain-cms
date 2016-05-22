<?php

namespace Bump\Serializer\Tests\Mocks;

use Bump\Serializer\Serializer;

/**
 * Class SerializerMock
 *
 * Is used for testing of abstract Serializer class.
 *
 * @package Bump\Serializer\Tests\Mocks
 */
class SerializerMock extends Serializer
{
    /**
     * Some value.
     *
     * @var
     */
    protected $value;

    /**
     * Saves new value.
     *
     * @param $newValue
     */
    public function setValue($newValue)
    {
        $this->value = $newValue;
    }

    /**
     *  Returns internal value.
     *
     * @return mixed
     */
    public function getValue()
    {
        return $this->value;
    }
}