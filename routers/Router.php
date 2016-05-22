<?php

use Bump\Core\CMS;
use Bump\Tools\Utils;

$routes = Utils::buildRoutes();

$routeOptions = function (\Slim\Route $rt) use ($app, $routes) {
    $url = rtrim($app->request->getPath(),'/').'/';
    $currentRoute = $rt->getPattern();
    $route = array_filter($routes, function($item) use ($url) {
        return $url == $item['url'] ? $item : null;
    });

    if (!count($route)) {
        $route = [
            'url' => $url,
            'route' => $currentRoute,
            'method' => $app->request->getMethod(),
            'meta' => getPageMeta([$url, $currentRoute])
        ];
        $routes[] = $route;
        CMS::Config()->cache->set('routes', $routes);
    } else {
        $route = array_shift($route);
    }
    $page = $app->container->get('page');
    $page['meta'] = $route['meta'];
    $fullUrl = $app->environment['slim.url_scheme'].'://'.CMS::Config()->MAINDOMAIN.$url;
    if ($route['meta']['protocol'] && $app->environment['slim.url_scheme'] != $route['meta']['protocol']) {
        $newUrl = str_replace($app->environment['slim.url_scheme'] . '://', $route['meta']['protocol'] . '://', $fullUrl);
        Bump\Tools\Utils::setCacheHeaders($page['meta']);
        $app->redirect($newUrl);
    }
    $app->container->set('page', $page);
};

$app->hook('slim.before.router', function () use ($app) {
    $page = [
        'config' => Bump\Core\CMS::Config(),
    ];
    $app->container->set('page', $page);
});

$app->hook('slim.after.router', function () use ($app) {
    $page = $app->container->get('page');
    if (array_key_exists('cachecontrol', $page['meta'])) {
        Bump\Tools\Utils::setCacheHeaders($page['meta']);
    }
});

$routers = glob(HOMEDIR.'/routers/*.router.php');
foreach ($routers as $router) {
    require $router;
}

/**
 * Try to find unknown URL in Url Mapper
 */
$app->notFound(function () use ($app) {
    $urlMaps = new Bump\Modules\UrlMaps\UrlMaps();
    $parts = parse_url($_SERVER['REQUEST_URI']);
    if ($row = $urlMaps->getRow([
        'old_url' => $parts['path']
    ])
    ) {
        Bump\Tools\Utils::setCacheHeaders($page['meta']);
        $url = (isset($parts['query']) && !empty($parts['query'])) ? $row['new_url'].'?'.$parts['query'] : $row['new_url'];
        $app->redirect($url, 301);
    }
    $seoMetaData = new \Bump\Modules\SeoMetaDatas\SeoMetaDatas();
    $meta = $seoMetaData->getRow([
        'url' => '/404'
    ]);
    $meta = ['title' => $meta['data']->f_xtitle, 'description' => $meta['data']->f_xdescription, 'keywords' => $meta['data']->f_xkeywords];
    $app->response->headers->set('Status', 404);
    $page = $app->container->get('page');
    $page['meta'] = $meta;
    $app->render('404.twig', $page);
});

function getPageMeta($routes)
{
    $data = [];
    $meta = new \Bump\Modules\SeoMetaDatas\SeoMetaDatas();
    if (!is_array($routes)) {
        $routes = [$routes];
    }
    $isAjax = CMS::Request()->isAjax();
    while (count($routes) && (!count($data) || in_array('', $data))) {
        $url = array_shift($routes);
        if ($row = $meta->getRow([
            'url' => $url
        ])
        ) {
            $dt = $isAjax ? $row['data']['data'] : $row['data'];
            // normalize fields names
            foreach (get_object_vars($dt) as $field => $value) {
                $fld = $field;
                if (substr($fld, 0, 3) == 'f_x') {
                    $fld = substr($fld, 3);
                }
                if (!isset($data[$fld]) || !$data[$fld]) {
                    $data[$fld] = $value;
                }
            }
        }
    }
    return $data;
}
