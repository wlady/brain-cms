<?php

use Bump\Core\CMS;
use Bump\Tools\Utils;

/**
 * @Route(Home Page)
 */
$app->get('/', $routeOptions, function () use ($app) {
    $page = $app->container->get('page');
    $app->render('page.index.twig', $page);
});

/**
 * @Route(XML Site Map)
 */
$app->get('/sitemap.xml', $routeOptions, function () use ($app, $routes) {
    $page = $app->container->get('page');
    // very simple solution - every route is a site map item
    $page['routes'] = $routes;
    $app->response->headers->set('Content-Type', 'application/xml');
    $app->render('page.xml-sitemap.twig', $page);
});
