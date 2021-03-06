<?php

namespace Bump\Core\Tests;

use Bump\Core\CMS;
use Bump\Core\Request;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-05-27 at 13:08:20.
 */
class RequestTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Request
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = Request::getInstance();
    }

    /**
     * @covers Bump\Core\Request::isAjax
     */
    public function testIsAjax()
    {
        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $this->assertTrue($this->object->isAjax());
    }

    /**
     * @covers Bump\Core\Request::getReqVar
     */
    public function testGetReqVar()
    {
        $data = ['foo' => 'bar', 'baz' => 'qux'];
        $this->assertEquals('bar', $this->object->getReqVar('foo', 'string', $data));
        CMS::Config()->request = $data;
        $this->assertEquals('bar', $this->object->getReqVar('foo', 'string'));
        $this->assertNull($this->object->getReqVar('xxx', 'string'));
    }

    /**
     * @covers Bump\Core\Request::sanitizeReqVars
     */
    public function testSanitizeReqVars()
    {
        $_REQUEST = ['foo' => 'bar', 'baz' => 'qux', 'integer' => '10', 'float' => '13.13'];
        CMS::Config()->request = $_REQUEST;
        $result = [];
        $this->object->sanitizeReqVars(['foo' => 'string', 'baz' => 'string', 'integer' => 'integer', 'float' => 'float'], $result);
        $this->assertEquals(['foo' => 'bar', 'baz' => 'qux', 'integer' =>  10, 'float' => 13.13], $result);
    }

}
