<?php

namespace Bump\Modules\UsersGroups\Tests;

use Bump\Modules\Auth\Auth;
use Bump\Modules\UsersGroups\UsersGroups;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-21 at 14:21:41.
 */
class UsersGroupsTest extends \Bump\Tests\BaseTest
{
    /**
     * @var UsersGroups
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new UsersGroups;
        $res = (new Auth())->auth([
            'login' => 'admin',
            'password' => 'admin'
        ]);
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
        $res = (new Auth())->unAuth();
    }

    /**
     * @covers Bump\Modules\UsersGroups\UsersGroups::init
     */
    public function testInit()
    {
        $this->object->init();
        $this->assertInstanceOf('\Bump\Modules\UsersGroups\Model\UsersGroup', $this->object->model);
    }

    /**
     * @covers Bump\Modules\UsersGroups\UsersGroups::getUsersGroupsArray
     */
    public function testGetUsersGroupsArray()
    {
        $rows = $this->object->getUsersGroupsArray();
        $cnt1 = count($rows);
        $this->assertTrue($cnt1>0);
        $rows = $this->object->getUsersGroupsArray([
            'empty' => 1
        ]);
        $cnt2 = count($rows);
        $this->assertTrue(count($cnt2)>0);
        $this->assertTrue($cnt2>$cnt1);
    }

    /**
     * @covers Bump\Modules\UsersGroups\UsersGroups::getAllUsersGroupsAssoc
     */
    public function testGetAllUsersGroupsAssoc()
    {
        $rows = $this->object->getAllUsersGroupsAssoc();
        $this->assertTrue(count($rows)>0);
    }

    /**
     * @covers Bump\Modules\UsersGroups\UsersGroups::getAllowedUsersGroupsArray
     */
    public function testGetAllowedUsersGroupsArray()
    {
        $rows = $this->object->getAllowedUsersGroupsArray();
        $this->assertTrue(count($rows)>0);
    }
}
