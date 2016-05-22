<?php

namespace Bump\Modules\Routes\Tests;

use Bump\Tools\Utils;
use Bump\Modules\Routes\Routes;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-21 at 14:21:40.
 */
class RoutesTest extends \Bump\Tests\BaseTest
{
    /**
     * @var Routes
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new Routes;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\Routes\Routes::init
     */
    public function testInit()
    {
        $this->object->init();
        $this->assertInstanceOf('\Bump\Modules\Routes\Model\Route', $this->object->model);
    }

    /**
     * @covers Bump\Modules\Routes\Routes::saveRows
     */
    public function testSaveRows()
    {
        $routes = Utils::buildRoutes();
        $this->object->saveRows($routes);
        $rows = $this->object->getRows();
        $this->assertTrue(count($rows) > 0);
    }
}
