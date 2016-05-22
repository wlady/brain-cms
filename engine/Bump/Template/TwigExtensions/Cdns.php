<?php

namespace Bump\Template\TwigExtensions;

class Cdns extends \Twig_Extension
{

    public function getName()
    {
        return 'cdns';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('useCdns', array($this, 'useCdns'))
        );
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('useCdns', array($this, 'useCdns')),
        );
    }

    public function useCdns($content, $isHtml = false)
    {
        if ($isHtml) {
            return \Bump\Tools\Utils::rewriteImgUrls($content);
        } else {
            if (\Bump\Tools\Utils::isNonCacheableUrl($content)) {
                return $content;
            }
            $cdns = \Bump\Core\CMS::Config()->cdns;
            $count = count($cdns);
            if ($count) {
                if (strtolower(substr($content, 0, 4)) == 'http') {
                    $resource = $content;
                } else {
                    $resource = $cdns[abs(crc32($content) % $count)].$content;
                }
                if (\Bump\Tools\Utils::getProtocol() == 'https') {
                    $resource = str_ireplace('http:', 'https:', $resource);
                }
                return $resource;
            }
        }
        return $content;
    }
}
