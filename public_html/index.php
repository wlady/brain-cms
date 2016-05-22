<?php

include_once __DIR__."/bootstrap.php";

$app = new Slim\Slim([
    'mode' => defined('ENGINEMODE') ? ENGINEMODE : '',
    'debug' => DEBUG,
    'view' => new Slim\Views\Twig(),
    'templates.path' => './tpl',
]);

$app->configureMode('development', function () use ($app) {
    $log = $app->getLog();
    $log->setEnabled(true);
    $log->setLevel(Slim\Log::DEBUG);
    $log->setWriter(new Bump\Tools\Logger());
});

$app->view->parserExtensions = $config->parserExtensions;

include_once HOMEDIR.'/routers/Router.php';

$app->run();
