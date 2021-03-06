<?php

namespace Bump\Modules\SeoMetaDatas\Tests;

use Bump\Core\CMS;
use Bump\Modules\SeoMetaDatas\SeoMetaDatas;

/**
 * Generated by PHPUnit_SkeletonGenerator on 2015-04-21 at 14:21:42.
 */
class SeoMetaDatasTest extends \Bump\Tests\BaseTest
{
    /**
     * @var SeoMetaDatas
     */
    protected $object;

    public static function setUpBeforeClass()
    {
        self::$fixtures = [
            '\\Bump\\Modules\\SeoMetaDatas\\Tests\\Fixtures\\SeoMetaDatasFixture',
        ];
        parent::setUpBeforeClass();
    }

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new SeoMetaDatas;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::init
     */
    public function testInit()
    {
        $this->object->init();
        $this->assertInstanceOf('\Bump\Modules\SeoMetaDatas\Model\SeoMetaData', $this->object->model);
    }

    /**
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::_postGetRows
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::_postGetRow
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::_preSaveRow
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::_postSaveRow
     */
    public function testManipulateRows()
    {
        $sql = 'SELECT * FROM cms_seometadatas';
        $rows = $this->object->db->getAll($sql);
        $foo = $this->getMethod('_postGetRows');
        $foo->invokeArgs($this->object, [&$rows]);
        $this->assertTrue($rows[0]['data'] instanceof \stdClass);
        $sql = 'SELECT * FROM cms_seometadatas';
        $row = $this->object->db->getRow($sql);
        $foo = $this->getMethod('_postGetRow');
        $foo->invokeArgs($this->object, [&$row]);
        $this->assertTrue($row['data'] instanceof \stdClass);
        $_REQUEST = CMS::Config()->request = (array) $row['data'];
        array_walk(CMS::Config()->request, function($item, $key) use (&$row) {
            $row[$key] = $item;
        });
        unset($row['data']);
        $foo = $this->getMethod('_preSaveRow');
        $foo->invokeArgs($this->object, [&$row]);
        $this->assertTrue(unserialize($row['data']) instanceof \stdClass);
        $foo = $this->getMethod('_postSaveRow');
        $foo->invokeArgs($this->object, [&$row]);
    }

    /**
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::copy
     */
    public function testCopy()
    {
        $sql = 'SELECT * FROM cms_seometadatas WHERE url=?';
        $row = $this->object->db->getRow($sql, '/php-unit-test');
        CMS::Config()->request['id'] = $row['id'];
        $res = $this->object->copy();
        $this->assertTrue($res['success']);
    }

    /**
     * @covers Bump\Modules\SeoMetaDatas\SeoMetaDatas::copy
     */
    public function testCopyException()
    {
        $this->expectedADOExceptionIn('Replace');
        $this->object->copy();
    }

}
