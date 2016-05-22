<?php

namespace Bump\Modules\UsersWhitelist\Tests;

use Bump\Modules\UsersWhitelist\UsersWhitelist;

class UsersWhitelistTest extends \Bump\Tests\BaseTest
{
    /**
     * @var UsersWhitelist
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new UsersWhitelist;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\UsersWhitelist\UsersWhitelist::init
     */
    public function testInit()
    {
        $this->object->init();
        $this->assertInstanceOf('\Bump\Modules\UsersWhitelist\Model\UsersWhitelist', $this->object->model);
    }

    /**
     * @covers Bump\Modules\UsersWhitelist\UsersWhitelist::_preSaveRow
     */
    public function testPreSaveRow()
    {
        $foo = $this->getMethod('_preSaveRow');
        $fields = [
            'id' => 0,
            'u_login' => 'phpunittest',
            'u_type' => 'Users',
            'u_password'=> 'password',
        ];
        $foo->invokeArgs($this->object, [&$fields]);
        $settings = unserialize($fields['u_settings']);
        $this->assertTrue(is_array($settings));
        $this->assertEquals($settings['user_theme'], 'bcms7');
    }
}
