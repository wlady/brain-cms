<?php

define('INIT_ENV', 1);

include_once __DIR__."/bootstrap.php";
if (empty($_SERVER['QUERY_STRING'])) {
    $request = explode('/', $_SERVER['REQUEST_URI']);
    $params = array_slice(array_unique($request), 2);
    if ($params) {
        foreach ($params as $param) {
            $parts = explode('=', $param);
            $_GET[$parts[0]] = $parts[1];
        }
        $_GET['src'] = base64_decode($_GET['src']);
        $_SERVER['QUERY_STRING'] = implode('&', $params);
    }
}
include_once "phpThumb/phpThumb.php";
