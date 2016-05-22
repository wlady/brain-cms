<?php

namespace Bump\Template\TwigExtensions;

use Bump\Core\CMS;

class Site extends \Twig_Extension
{

    public function getName()
    {
        return 'site';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('siteUrl', array($this, 'siteUrl'))
        );
    }

    public static function siteUrl($url)
    {
        $config = CMS::Config();
        if (($newUrl = $config->cache->get($url))) {
            return $newUrl;
        }
        global $app;
        $routes = \Bump\Tools\Utils::buildRoutes();
        $route = current(array_filter($routes, function($item) use ($url) {
                return self::slimPathDetect($url, $item['url']) ? $item : null;
            }));
        $fullUrl = $app->environment['slim.url_scheme'].'://'.$config->MAINDOMAIN.$url;
        if (isset($route['meta']['protocol']) && $route['meta']['protocol'] === 'https' && $app->environment['slim.url_scheme'] !== 'https') {
            $newUrl = str_replace('http://', 'https://', $fullUrl);
        } elseif (isset($route['meta']['protocol']) && $route['meta']['protocol'] === 'http' && $app->environment['slim.url_scheme'] === 'https') {
            $newUrl = str_replace('https://', 'http://', $fullUrl);
        } else {
            $newUrl = $fullUrl;
        }
        $config->cache->set($url, $newUrl);
        return $newUrl;
    }

    public static function slimPathDetect($path, $item)
    {

        if (strpos($item, ':') === false) {
            return $item == $path ? true : false;
        }
        $arPath = explode('/', trim($path, '/'));
        $arItem = explode('/', trim($item, '/'));
        if (count($arItem) != count($arPath)) {
            return false;
        }
        $flag = true;
        foreach ($arItem as $key => $val) {
            if (strpos($val, ':') === false) {
                if ($val != $arPath[$key]) {
                    $flag = false;
                    break;
                }
            }
        }
        return $flag;
    }
}
