<?php

namespace Bump\Template\Tests\TwigExtensions;

use Bump\Template\TwigExtensions\Cdns;
use Bump\Core\CMS;

class CdnsTest extends AbstractTwigExtensionsTest
{
    protected $object;

    /** @inheritdoc */
    public function setUp()
    {
        CMS::config()->noncacheable = [];
        CMS::config()->cdns = [];

        $this->object = new Cdns();
    }

    public function testGetName()
    {
        $this->assertEquals('cdns', $this->object->getName());
    }

    /**
     * Testing with non cachable url.
     *
     * @covers Bump\Template\TwigExtensions\Cdns::useCdns
     */
    public function testUseCdnsWithNonCachableUrl()
    {
        $_SERVER['REQUEST_URI'] = '/foo/bar';
        CMS::config()->noncacheable = [
            '/foo/bar'
        ];

        $this->assertEquals(
            'http://url_without_using_cdn',
            $this->object->useCdns('http://url_without_using_cdn', false)
        );
    }

    /**
     * Testing case when there are no 'cdn' provided.
     *
     * @covers Bump\Template\TwigExtensions\Cdns::useCdns
     */
    public function testUseCdnsWithoutCdnsProvided()
    {
        $this->assertEquals(
            '/test_resource',
            $this->object->useCdns('/test_resource', false)
        );
    }

    /**
     * Testing case when 'cdn' is provided.
     *
     * @covers Bump\Template\TwigExtensions\Cdns::useCdns
     *
     * @dataProvider useCdnsProvider
     */
    public function testUseCdnsWithCachableUrl($content, $isHtml, $expected)
    {
        CMS::config()->cdns = [
            'cdn1.test'
        ];

        $this->assertEquals(
            $expected,
            $this->object->useCdns($content, $isHtml)
        );
    }

    /**
     * Testing case when 'https' is enabled on the server.
     *
     * @covers Bump\Template\TwigExtensions\Cdns::useCdns
     */
    public function testUseCdnsWithHttps()
    {
        $_SERVER['HTTPS'] = 'on';
        CMS::config()->cdns = [
            'cdn1.test'
        ];

        $this->assertEquals(
            'https://test_resource',
            $this->object->useCdns('http://test_resource', false)
        );
    }

    public function useCdnsProvider()
    {
        return [[
                // Will be processed by Utils function. But in this case it's not matter.
                'html_content_with_images_urls', true, 'html_content_with_images_urls'
            ], [
                'http://test_resource', false, 'http://test_resource'
            ], [
                'https://test_resource', false, 'https://test_resource'
            ], [
                // Only resources with relative url's should be taken from cdn.
                '/test_resource', false, 'cdn1.test/test_resource'
            ]
        ];
    }
}
