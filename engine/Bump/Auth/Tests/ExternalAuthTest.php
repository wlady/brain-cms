<?php

namespace Bump\Auth\Tests;

use Bump\Auth\ExternalAuth;

class ExternalAuthTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @covers Bump\Auth\ExternalAuth::__construct
     */
    public function testConstruct()
    {
        $mock = $this->getMockForAbstractClass('Bump\Auth\ExternalAuth', [], 'zUsers');
        $this->assertTrue(ExternalAuth::isSingle());
        $this->assertEquals([
            'user_login',
            'user_password',
            'user_email',
        ], ExternalAuth::getExcludedFields());
    }


    /**
     * @covers Bump\Auth\ExternalAuth::getAuthUser
     * @covers Bump\Auth\ExternalAuth::getShortClass
     */
    public function testGetAuthUser()
    {
        $mock = $this->getMockForAbstractClass('Bump\Auth\ExternalAuth', [], 'zUsers');
        $user = $mock->getAuthUser();
        $this->assertTrue(is_array($user));
        $this->assertArrayHasKey('user_type', $user);
        $this->assertEquals('Users', $user['user_type']);

        $mock = $this->getMockForAbstractClass('Bump\Auth\ExternalAuth', [], 'zFoobar');
        $user = $mock->getAuthUser();
        $this->assertEmpty($user);
    }

}
