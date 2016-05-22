<?php

namespace Bump\Modules\reCaptcha\Tests;

use Bump\Core\CMS;
use Bump\Modules\reCaptcha\reCaptcha;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-22 at 13:27:07.
 */
class reCaptchaTest extends \Bump\Tests\BaseTest
{
    /**
     * @var Captcha
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new reCaptcha;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\reCaptcha\reCaptcha::init
     */
    public function testInit()
    {
        $this->object->init();
    }

    /**
     * @covers Bump\Modules\reCaptcha\reCaptcha::widget
     */
    public function testWidget()
    {
        $settings = $this->object->getSettings();
        $this->assertEquals(
            $this->object->widget(),
            '<div class="g-recaptcha" data-sitekey="' . $settings['site_key'] . '"></div>'
        );
    }

    /**
     * @covers Bump\Modules\reCaptcha\reCaptcha::verify
     */
    public function testVerify()
    {
        $this->assertFalse($this->object->verify());
    }
}
