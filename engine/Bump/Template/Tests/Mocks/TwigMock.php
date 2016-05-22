<?php

namespace Bump\Template\Tests\Mocks;

use Bump\Template\Twig;

/**
 * Class TwigNonSingletone
 *
 * Used for invoking of Twig as non singleton class.
 *
 * @package Bump\Template\Tests
 */
class TwigMock extends Twig
{
    public function __construct()
    {
    }

    /**
     * Should be declared due to necessity to invoke Twig_Environment withou caching enabled.
     *
     * @param $loader
     * @return \Twig_Environment
     */
    protected function getEnvironment($loader)
    {
        $env = new \Twig_Environment($loader, [
            'cache' => false,
            'debug' => true
        ]);

        return $env;
    }

    protected function getEnvironmentOriginal($loader)
    {
        return parent::getEnvironment($loader);
    }
}
