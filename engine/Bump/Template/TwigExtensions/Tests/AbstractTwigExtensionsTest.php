<?php

namespace Bump\Template\TwigExtensions\Tests;

/**
 * Class AbstractTwigExtensionsTest
 *
 * Contains global test cases for twig extension class.
 *
 * @package Bump\Template\Tests\TwigExtensions
 */
abstract class AbstractTwigExtensionsTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @covers Bump\Template\TwigExtensions\Cdns::getFunctions
     * @covers Bump\Template\TwigExtensions\Form::getFunctions
     * @covers Bump\Template\TwigExtensions\Site::getFunctions
     * @covers Bump\Template\TwigExtensions\Utils::getFunctions
     */
    public function testGetFunctions()
    {
        $functions = $this->object->getFunctions();

        foreach ($functions as $function) {
            $this->assertInstanceOf('\Twig_SimpleFunction', $function);
            $this->assertTrue(is_callable($function->getCallable()));
        }
    }

    public function testGetFilters()
    {
        $filters = $this->object->getFilters();

        foreach ($filters as $filter) {
            $this->assertInstanceOf('\Twig_SimpleFilter', $filter);
            $this->assertTrue(is_callable($filter->getCallable()));
        }
    }
}
