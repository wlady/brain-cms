<?php

namespace Bump\Serializer\Test;

use Bump\Tests\BaseTest;
use Bump\Serializer\Standard;

class StandardTest extends BaseTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        $this->object = new Standard();
    }

    /**
     * @covers Bump\Serializer\Standard::setValue
     * @covers Bump\Serializer\Standard::getValue
     *
     * @dataProvider rawDataProvider
     */
    public function testSetGetValue($raw)
    {
        $setValue = $this->getMethod('setValue');
        $getValue = $this->getMethod('getValue');
        $serialized = serialize($raw);

        $this->assertEquals($serialized, $setValue->invokeArgs($this->object, [$raw]));
        $this->assertEquals($raw, $getValue->invokeArgs($this->object, [$serialized]));

    }

    public function rawDataProvider()
    {
        return [
            [1],
            [1.1],
            ['test_string'],
            [[1, 1.1, 'test_string']]
        ];
    }
}
