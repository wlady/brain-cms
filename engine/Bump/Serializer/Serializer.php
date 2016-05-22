<?php

namespace Bump\Serializer;

abstract class Serializer implements SerializerInterface
{

    public function serialize($data)
    {
        return $this->setValue($data);
    }

    public function unserialize($data)
    {
        return $this->getValue($data);
    }

}
