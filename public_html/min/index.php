<?php

include_once __DIR__."/../bootstrap.php";

// custom settings
$minDir = HOMEDIR.'/vendor/mrclay/minify/min';
require $minDir.'/config.php';
require $minDir.'/lib/Minify/Cache/Memcache.php';
$cache = \Bump\Core\CMS::Config()->cache;
if ($cache instanceof \Bump\Cache\Memcached) {
    $memcache = new \Memcached();
    $memcache->addServer('127.0.0.1', 11211);
    $min_cachePath = new Minify_Cache_Memcache($memcache);
} elseif ($cache instanceof \Bump\Cache\Memcache) {
    $memcache = new \Memcache();
    $memcache->connect('127.0.0.1', 11211);
    $min_cachePath = new Minify_Cache_Memcache($memcache);
} else {
    // bcms default temp dir
    define('MINIFYDIR', TMPDIR.'.minify');
    if (!file_exists(MINIFYDIR)) {
        mkdir(MINIFYDIR);
    }
    $min_cachePath = MINIFYDIR;
}
require __DIR__.'/cdns.php';

include_once $minDir.'/index.php';
