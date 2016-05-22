<?php

namespace Bump\Serializer\Tests;

use Bump\Serializer\Tests\Mocks\SerializerMock;

class SerializerTest extends \PHPUnit_Framework_TestCase
{
    protected $object;

    public function setUp()
    {
        $this->object = new SerializerMock();
    }

    public function testSerialize()
    {
        $this->object->serialize('test_data');

        $this->assertEquals('test_data', $this->object->getValue());
    }

    public function testUnserialize()
    {
        $this->object->setValue('test_data');

        $this->assertEquals('test_data', $this->object->unserialize());
    }
}
