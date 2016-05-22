<?php

namespace Bump\Serializer\Tests;

use Bump\Tests\BaseTest;
use Bump\Serializer\Igbinary;

require_once "Mocks/functions.php";

class IgbinarTest extends BaseTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        $this->object = $this
            ->getMockBuilder('Bump\Serializer\Igbinary')
            ->disableOriginalConstructor()
            ->getMock();
    }

    /**
     * @covers  Bump\Serializer\Igbinary::__construct
     */
    public function testConstructor()
    {
        if (!extension_loaded('igbinary')) {
            $this->setExpectedException('\Exception');
        }

        new Igbinary();
    }

    /**
     * @covers  Bump\Serializer\Igbinary::setValue
     * @covers  Bump\Serializer\Igbinary::getValue
     *
     * @dataProvider rawDataProvider
     */
    public function testSetGetValue($raw)
    {
        $setValue = $this->getMethod('setValue');
        $getValue = $this->getMethod('getValue');
        $serialized = igbinary_serialize($raw);

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
