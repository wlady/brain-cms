<?php

namespace Bump\Serializer;

class Standard extends Serializer
{
    protected function setValue($data)
    {
        return serialize($data);
    }

    protected function getValue($data)
    {
        return unserialize($data);
    }
}
