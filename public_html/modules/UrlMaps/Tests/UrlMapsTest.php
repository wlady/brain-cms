<?php

namespace Bump\Modules\UrlMaps\Tests;

use Bump\Modules\UrlMaps\UrlMaps;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-21 at 14:21:42.
 */
class UrlMapsTest extends \Bump\Tests\BaseTest
{
    /**
     * @var UrlMaps
     */
    protected $object;

    public static function setUpBeforeClass()
    {
        self::$fixtures = [
            '\\Bump\\Modules\\UrlMaps\\Tests\\Fixtures\\UrlMapsFixture',
        ];
        parent::setUpBeforeClass();
    }

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new UrlMaps;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\UrlMaps\UrlMaps::init
     */
    public function testInit()
    {
        $this->object->init();
        $this->assertInstanceOf('\Bump\Modules\UrlMaps\Model\UrlMap', $this->object->model);
    }

    /**
     * @covers Bump\Modules\UrlMaps\UrlMaps::_preSaveRow
     * @covers Bump\Modules\UrlMaps\UrlMaps::_postSaveRow
     * @covers Bump\Modules\UrlMaps\UrlMaps::normalize
     */
    public function testSaveRow()
    {
        $row = $this->object->getRow();
        $foo = $this->getMethod('_preSaveRow');
        $foo->invokeArgs($this->object, [&$row]);
        $foo = $this->getMethod('_postSaveRow');
        $foo->invokeArgs($this->object, [&$row]);
        $foo = $this->getMethod('normalize');
        $url = 'http://username:password@hostname:9090/path?arg=value#anchor';
        $res = $foo->invokeArgs($this->object, [$url]);
        $this->assertEquals($res, '/path?arg=value#anchor');
    }

    /**
     * @covers Bump\Modules\UrlMaps\UrlMaps::_preSaveRow
     * @expectedException \Exception
     */
    public function testSaveRowException()
    {
        $row = array(
            'id' => 'phpunit',
            'old_url' => 'phpunittest',
            'new_url' => 'www.phpunittestnew2.com'
        );
        $foo = $this->getMethod('_preSaveRow');
        $foo->invokeArgs($this->object, [&$row]);
    }
}
