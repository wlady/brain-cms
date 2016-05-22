<?php

namespace Bump\Template\TwigExtensions\Tests;

use Bump\Template\TwigExtensions\Site;
use Bump\Core\CMS;

class SiteTest extends AbstractTwigExtensionsTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        $this->object = new Site();
    }

    public function testGetName()
    {
        $this->assertEquals('site', $this->object->getName());
    }

    /**
     * @dataProvider slimPathDetectProvider
     */
    public function testSlimPathDetect($path, $item, $expected)
    {
        $this->assertEquals($expected, $this->object->slimPathDetect($path, $item));
    }

    /**
     * Simulates case when url is cached,
     *
     * @covers Bump\Template\TwigExtensions\Site::siteUrl
     */
    public function testSiteUrlFromCache()
    {
        $config = CMS::Config();
        $config->cache = $this
            ->getMockBuilder('Bump\Cache\File')
            ->disableOriginalConstructor()
            ->getMock();

        $config
            ->cache
            ->method('get')
            ->willReturn('http://cached_url');

        $this->assertEquals('http://cached_url', $this->object->siteUrl('http://cached_url'));
    }

    /**
     * @dataProvider siteUrlProvider
     */
    public function testSiteUrl($cmsTestRoutes, $slimUrlScheme, $url, $expected)
    {
        global $app;

        $app = (new \stdClass());
        $app->environment = [
            'slim.url_scheme' => $slimUrlScheme
        ];

        $config = CMS::Config();
        $config->MAINDOMAIN = 'testdomain.com';

        $config->cache = $this
            ->getMockBuilder('Bump\Cache\File')
            ->disableOriginalConstructor()
            ->getMock();

        // Skipping the block with cached url.
        $config
            ->cache
            ->expects($this->at(0))
            ->method('get')
            ->willReturn(false);

        // Simulating cached routes.
        $config
            ->cache
            ->expects($this->at(1))
            ->method('get')
            ->willReturn($cmsTestRoutes);

        $this->assertEquals($expected, $this->object->siteUrl($url));
    }

    public function siteUrlProvider()
    {
        $cmsTestRoutes = [[
                'url' => '/test_route1',
                'meta' => [
                    'protocol' => 'https'
                ]
            ], [
                'url' => '/test_route2',
                'meta' => [
                    'protocol' => 'http'
                ]
            ], [
                'url' => '/test_route3'
            ]
        ];

        return [[
                $cmsTestRoutes, 'http', '/test_route1', 'https://testdomain.com/test_route1'
            ], [
                $cmsTestRoutes, 'https', '/test_route2', 'http://testdomain.com/test_route2'
            ], [
                $cmsTestRoutes, 'http', '/test_route3', 'http://testdomain.com/test_route3'
            ], [
                $cmsTestRoutes, 'https', '/test_route3', 'https://testdomain.com/test_route3'
            ]
        ];
    }

    public function slimPathDetectProvider()
    {
        return [[
                '/foo', '/foo1', false
            ], [
                '/foo', '/foo', true
            ],  [
                '/foo', '/foo:param', true
            ], [
                '/foo/bar', '/foo/bar:param', true
            ], [
                '/foo', '/foo/bar:param', false
            ], [
                '/foo1/bar', '/foo/bar:param', false
            ]
        ];
    }
}
