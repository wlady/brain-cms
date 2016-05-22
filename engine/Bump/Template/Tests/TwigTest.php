<?php

namespace Bump\Template\Tests;

use Bump\Template\Tests\Mocks\TwigMock;
use Bump\Tests\BaseTest;

class TwigTest extends BaseTest
{
    protected $object;

    /**
     * @inheritdoc
     */
    public function setUp()
    {
        $this->object = new TwigMock();
        $this->object->setTpls($this->getParams());
        $this->object->setTplDir(__DIR__ . '/Mocks/Templates');
    }

    protected function getParams()
    {
        return [
            'param1' => 'val1',
            'param2' => 'val2'
        ];
    }

    public function testGetTplsValue()
    {
        $this->assertEquals($this->getParams(), $this->invokeMethod('getTplsValue'));
    }

    public function testGetEnvironment()
    {
        $loader = new \Twig_Loader_Filesystem('/');
        $env = $this->invokeMethod('getEnvironmentOriginal', [$loader]);

        $this->assertInstanceOf('\Twig_Environment', $env);
    }

    /**
     * @depends testGetTplsValue
     */
    public function testGetSetTplValue()
    {
        $this->invokeMethod('setTplValue', ['test_param', 'test_value']);
        $this->assertEquals('test_value', $this->invokeMethod('getTplValue', ['test_param']));

        $this->invokeMethod('setTplValue', ['test_param', '_additional_part', false]);
        $this->assertEquals('test_value_additional_part', $this->invokeMethod('getTplValue', ['test_param']));

        $this->invokeMethod('setTplValue', ['test_param', 'overwritten_value']);
        $this->assertEquals('overwritten_value', $this->invokeMethod('getTplValue', ['test_param']));

        $this->assertNull($this->invokeMethod('getTplValue', ['undefined_param']));
    }

    public function testLoadStringResource()
    {
        $stringTempalte = 'param1 = "{{param1}}", param2 = "{{param2}}"';

        $this->assertEquals(
            'param1 = "val1", param2 = "val2"',
            $this->invokeMethod('loadStringResource', [$stringTempalte])
        );
    }

    /**
     * @dataProvider toStringValueProvider
     */
    public function testToStringValue($template, $saveDir, $expected)
    {
        $this->assertEquals($expected, $this->invokeMethod('toStringValue', [$template, $saveDir]));
    }

    public function testToStringValueWithForceDir()
    {
        $this->invokeMethod('forceTplDirValue', [__DIR__ . '/Mocks/Templates/ForcedDir']);

        $this->assertEquals('Forced dir tpl: param1 = "val1", param2 = "val2"', $this->invokeMethod('toStringValue', ['test.twig']));
    }

    public function testToStringValueWithDefaultTemplate()
    {
        $this->assertEquals('Default tpl: param1 = "val1", param2 = "val2"', $this->invokeMethod('toStringValue'));
    }

    public function toStringValueProvider()
    {
        return [[
            'string:param1 = "{{param1}}", param2 = "{{param2}}"', null, 'param1 = "val1", param2 = "val2"'
        ], [
            __DIR__ . '/Mocks/Templates/test.twig', null, 'Test tpl: param1 = "val1", param2 = "val2"'
        ]];
    }
}
