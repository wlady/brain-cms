<?php

namespace Bump\Auth\Tests;

use Bump\Auth\Single;

class SingleTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Test
     */
    protected $object;

    function setUp() {
        $this->object = new Single;
    }

    /**
     * @covers Bump\Auth\Single::__construct
     */
    public function testConstructor()
    {
        $this->assertInstanceOf('\Bump\Auth\Single', $this->object);

    }

    /**
     * @covers Bump\Auth\Single::auth
     */
    public function testAuth()
    {
        $res = $this->object->auth();
        $this->assertFalse($res);
    }
}
