<?php

namespace Bump\Template\Tests;

use Bump\Template\Tests\Mocks\TemplateMock;
use Bump\Tests\BaseTest;

class TemplateTest extends BaseTest
{
    protected $object;

    /**
     * @inheritdoc
     */
    public function setUp()
    {
        $this->object = new TemplateMock();
    }

    protected function getParams()
    {
        return [
            'param1' => 'val1',
            'param2' => 'val2'
        ];
    }

    public function testGetSetTpls()
    {
        $this->object->setTpls($this->getParams());

        $this->assertEquals($this->getParams(), $this->object->getTpls());
    }

    public function testSaveTplDirs()
    {
        $this->setProperty('tplDir', 'old_dir');
        $this->setProperty('forceDir', 'old_force_dir');

        $this->object->saveTplDirs();

        $this->setProperty('tplDir', 'new_dir');
        $this->setProperty('forceDir', 'new_force_dir');

        $this->object->restoreTplDirs();

        $this->assertEquals('old_dir', $this->getProperty('tplDir'));
        $this->assertEquals('old_force_dir', $this->getProperty('forceDir'));
    }
}
