<?php

namespace Bump\Template\TwigExtensions\Tests;

use Bump\Template\TwigExtensions\Form;

class FormTest extends AbstractTwigExtensionsTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        $this->object = new Form();
    }

    public function testGetName()
    {
        $this->assertEquals('form', $this->object->getName());
    }

    /**
     * @dataProvider textProvider
     */
    public function testText($name, $attrs, $expected)
    {
        $this->assertEquals($expected, $this->object->text($name, $attrs));
    }

    /**
     * @dataProvider inputProvider
     */
    public function testInput($name, $attrs, $expected)
    {
        $this->assertEquals($expected, $this->object->input($name, $attrs));
    }

    /**
     * @dataProvider selectProvider
     */
    public function testSelect($name, $attrs, $expected)
    {
        $this->assertEquals($expected, $this->object->select($name, $attrs));
    }

    public function selectProvider()
    {
        return [[
                'test_name',
                [],
                '<select name="test_name"></select>'
            ], [
                'test_name',
                [
                    'attr1' => 'attr1_value',
                    'attr2' => 'attr2_value'
                ],
                '<select name="test_name" attr1="attr1_value" attr2="attr2_value"></select>'
            ], [
                'test_name', [
                    'options' => [
                        'opt1_value' => 'opt1_display',
                        'opt2_value' => 'opt2_display'
                    ]
                ],
                '<select name="test_name"><option value="opt1_value">opt1_display</option><option value="opt2_value">opt2_display</option></select>'
            ], [
                'test_name', [
                    'value' => 'opt1_value',
                    'options' => [
                        'opt1_value' => 'opt1_display',
                        'opt2_value' => 'opt2_display'
                    ]
                ],
                '<select name="test_name"><option value="opt1_value" selected>opt1_display</option><option value="opt2_value">opt2_display</option></select>'
            ]
        ];
    }

    public function inputProvider()
    {
        return [[
                'test_name',
                [],
                '<input name="test_name" type="text"/>'
            ], [
                'test_name', [
                    'type' => 'password'
                ],
                '<input name="test_name" type="password"/>'
            ], [
                'test_name', [
                    'checked' => ''
                ],
                '<input name="test_name" type="text"/>'
            ], [
                'test_name', [
                    'checked' => '1'
                ],
                '<input name="test_name" checked type="text"/>'
            ], [
                'test_name',
                [
                    'attr1' => 'attr1_value',
                    'attr2' => 'attr2_value'
                ],
                '<input name="test_name" attr1="attr1_value" attr2="attr2_value" type="text"/>'
            ]
        ];
    }

    public function textProvider()
    {
        return [[
                'test_name',
                [],
                '<textarea name="test_name"></textarea>'
            ], [
                'test_name', [
                    'value' => 'test_value'
                ],
                '<textarea name="test_name">test_value</textarea>'
            ], [
                'test_name', [
                    'attr1' => 'attr1_value',
                    'attr2' => 'attr2_value'
                ],
                '<textarea name="test_name" attr1="attr1_value" attr2="attr2_value"></textarea>'
            ]
        ];
    }
}
