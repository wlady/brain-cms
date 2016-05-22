<?php

namespace Bump\Core\Tests;

use Bump\Core\AdminBaseClass;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-05-27 at 13:11:03.
 */
class AdminBaseClassTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var AdminBaseClass
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new AdminBaseClass;
    }

    /**
     * @covers Bump\Core\AdminBaseClass::__construct
     */
    public function testConstruct()
    {
        $this->object = new AdminBaseClass();
        $this->assertNotEmpty(AdminBaseClass::$config);
        $this->assertNotEmpty(AdminBaseClass::$request);
        $this->assertNotEmpty(AdminBaseClass::$template);
    }

    /**
     * @covers Bump\Core\AdminBaseClass::call
     */
    public function testCall()
    {
        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $data = ['_m' => 'Auth', '_a' => 'auth'];
        $res = $this->object->call($data);
        $this->assertArrayHasKey('success', $res);
        $this->assertFalse($res['success']);

        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $data = ['_m' => 'EmailForms', '_a' => 'getFormsArray'];
        $res = $this->object->call($data);
        $this->assertFalse($res);

        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $data = ['_m' => 'EmailForms', '_a' => 'unknownMethod'];
        $res = $this->object->call($data);
        $this->assertFalse($res);

        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $data = ['_m' => 'EmailForms'];
        $res = $this->object->call($data);
        $this->assertFalse($res);
    }

    /**
     * @covers Bump\Core\AdminBaseClass::call
     * @expectedException \Exception
     */
    public function testCallWithException()
    {
        $data = ['_m' => 'SysInfo', '_a' => 'throwException'];
        $this->object->call($data);
    }

}