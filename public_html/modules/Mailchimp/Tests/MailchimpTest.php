<?php

namespace Bump\Modules\Mailchimp\Tests;

use Bump\Core\CMS;
use Bump\Modules\Mailchimp\Mailchimp;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-22 at 13:27:07.
 */
class MailchimpTest extends \Bump\Tests\BaseTest
{
    /**
     * @var Mailchimp
     */
    protected $object;

    public static function setUpBeforeClass()
    {
        self::$fixtures = array(
            '\\Bump\\Modules\\Mailchimp\\Tests\\Fixtures\\MailchimpFixture'
        );
        parent::setUpBeforeClass();
    }

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new Mailchimp;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\Mailchimp\Mailchimp::init
     * @covers Bump\Modules\Mailchimp\Mailchimp::getSettings
     */
    public function testInit()
    {
        $settings = $this->object->getSettings();
        $this->assertTrue(is_array($settings)
                          && isset($settings['api_key'])
                          && isset($settings['active_list_id'])
                          && $settings['api_key']
                          && $settings['active_list_id']);
    }

    /**
     * @covers Bump\Modules\Mailchimp\Mailchimp::getList
     */
    public function testGetList()
    {
        $result = $this->object->getList();
        $this->assertTrue(is_array($result)
                          && isset($result['total'])
                          && isset($result['data']));
    }

    /**
     * @covers Bump\Modules\Mailchimp\Mailchimp::getMembers
     */
    public function testGetMembers()
    {
        $result = $this->object->getMembers();
        $this->assertTrue(is_array($result)
                          && isset($result['total'])
                          && isset($result['data']));
    }

    /**
     * @covers Bump\Modules\Mailchimp\Mailchimp::getRows
     */
    public function testGetRows()
    {
        CMS::Config()->request['_t'] = 'list';
        $result = $this->object->getRows();
        $this->assertTrue(is_array($result)
                          && isset($result['metaData'])
                          && isset($result['results'])
                          && isset($result['rows']));
        // get from local DB
        CMS::Config()->request['_t'] = '';
        $result = $this->object->getRows();
        $this->assertTrue(is_array($result));
    }

}
