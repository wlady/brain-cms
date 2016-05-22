<?php

namespace Bump\Core\Tests;

use Bump\Core\Session;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-05-27 at 13:09:12.
 */
class SessionTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Session
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = Session::getInstance();
    }


    /**
     * @covers Bump\Core\Session::init
     */
    public function testInit()
    {
        $this->object->init();
        $_SERVER['HTTP_X_REQUESTED_WITH'] = 'xmlhttprequest';
        $this->object->init();
        $this->object->setItem('foo_bar', 123);
        $this->assertTrue($this->object->isItem('foo_bar'));
    }

     /**
     * @covers Bump\Core\Session::isItem
     */
    public function testIsItem()
    {
        $this->assertFalse($this->object->isItem('test'));
        $this->object->setItem('test', 123);
        $this->assertTrue($this->object->isItem('test'));
    }

    /**
     * @covers Bump\Core\Session::getItem
     */
    public function testGetItem()
    {
        $this->object->setItem('test', 123);
        $this->assertEquals(123, $this->object->getItem('test'));
    }

    /**
     * @covers Bump\Core\Session::setItem
     */
    public function testSetItem()
    {
        $this->object->setItem('test', 123);
        $this->assertEquals(123, $this->object->getItem('test'));
    }

    /**
     * @covers Bump\Core\Session::clearItem
     */
    public function testClearItem()
    {
        $this->object->setItem('test', 123);
        $this->assertEquals(123, $this->object->getItem('test'));
        $this->object->clearItem('test');
        $this->assertFalse($this->object->isItem('test'));
    }

    /**
     * @covers Bump\Core\Session::clearAll
     */
    public function testClearAll()
    {
        $this->object->setItem('test1', 123);
        $this->object->setItem('test2', 1234);

        $this->assertEquals(123, $this->object->getItem('test1'));
        $this->assertEquals(1234, $this->object->getItem('test2'));

        $this->object->clearAll();

        $this->assertFalse($this->object->isItem('test1'));
        $this->assertFalse($this->object->isItem('test2'));
    }

    /**
     * @covers Bump\Core\Session::getSID
     */
    public function testGetSID()
    {
        $this->assertTrue(is_string($this->object->getSID()));
    }
}