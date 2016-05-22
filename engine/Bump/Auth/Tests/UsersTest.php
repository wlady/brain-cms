<?php

namespace Bump\Auth\Tests;

use Bump\Auth\Users;
use Bump\Core\CMS;
use Bump\Tests\BaseTest;

/**
 * @backupGlobals disabled
 */
class UsersTest extends BaseTest
{
    /**
     * @var Users
     */
    protected $object;

    protected function setUp()
    {
        $this->object = new Users();
    }

    public static function setUpBeforeClass()
    {
        self::$fixtures = [
            'Bump\\Auth\\Tests\\Fixtures\\UsersFixture',
        ];

        parent::setUpBeforeClass();
    }

    /**
     * @covers Bump\Auth\Users::__construct
     */
    public function testConstruct()
    {
        $this->object = new Users();
        $this->assertFalse(Users::isSingle());
        $this->assertEquals('Local User', Users::getTitle());
    }

    /**
     * @covers Bump\Auth\Users::auth
     */
    public function testAuth()
    {
        $this->assertTrue($this->object->auth(['login' => 'phpunittest', 'password' => 'password']));
        $this->assertTrue(boolval(CMS::User()->isRegistered()));
        $this->assertFalse($this->object->auth(['login' => 'phpunittest', 'password' => 'bad_pass']));
    }
}
