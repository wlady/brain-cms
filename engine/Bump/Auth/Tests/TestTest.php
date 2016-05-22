<?php

namespace Bump\Auth\Tests;

use Bump\Auth\Test;

class TestTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Test
     */
    protected $object;

    function setUp() {
        $this->object = new Test;
    }

    /**
     * @covers Bump\Auth\Test::__construct
     */
    public function testConstructor()
    {
        $this->assertInstanceOf('\Bump\Auth\Test', $this->object);

    }

    /**
     * @covers Bump\Auth\Test::auth
     */
    public function testAuth()
    {
        $res = $this->object->auth();
        $this->assertFalse($res);
    }
}
