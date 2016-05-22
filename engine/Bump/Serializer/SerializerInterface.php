<?php

namespace Bump\Serializer;

interface SerializerInterface
{
    public function serialize($data);

    public function unserialize($data);
}
