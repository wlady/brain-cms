<?php

namespace Bump\Lang\Tests;

use Bump\Core\CMS;
use Bump\Lang\En;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-05-21 at 11:54:30.
 */
class EnTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var En
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $lang = 'en';
        CMS::Session()->getInstance()->setItem('lang', $lang);
        En::setLang($lang);
        $this->object = En::getInstance();
    }

    public function testEnglishTranslation()
    {
        $this->assertEquals($this->object->welcome, 'Welcome to ');
        $this->assertNotEquals($this->object->welcome, 'Some Text');
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }
}
