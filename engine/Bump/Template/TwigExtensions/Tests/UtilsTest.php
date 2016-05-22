<?php

namespace Bump\Template\TwigExtensions\Tests;

use Bump\Template\TwigExtensions\Utils;

class UtilsTestt extends AbstractTwigExtensionsTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        $this->object = new Utils();
    }

    public function testGetName()
    {
        $this->assertEquals('utils', $this->object->getName());
    }

    /**
     * @dataProvider recursiveArrayProvider
     */
    public function testRecursiveArray($params, $expected)
    {
        $this->assertEquals($expected, $this->object->recursiveArray($params));
    }

    public function recursiveArrayProvider()
    {
        $elements = [];

        for ($i = 0; $i < 3; $i++) {
            $elements[] = [
                'id' => "{id-$i}",
                'url' => "{url-$i}",
                'text' => "{text-$i}"
            ];
        }

        $children = $elements[2];
        $elements[0]['children'] = $children;

        // Prepared valid htm snapshot.
        $snapshot = file_get_contents(__DIR__ . '/Snapshots/recursiveArray.html');

        return [[
                [], ''
            ], [
                ['array' => []], ''
            ], [
                ['array' => [$elements[0], $elements[1]]], $snapshot
            ]
        ];
    }
}
