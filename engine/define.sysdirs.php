<?php

if (!defined('HOMEDIR')) {
    define('HOMEDIR',          rtrim(realpath(__DIR__.'/../'), DIRECTORY_SEPARATOR));
}
if (!defined('TMPDIR')) {
    define('TMPDIR',           HOMEDIR.'/data/');
}
if (!defined('SESSION_PATH')) {
    define('SESSION_PATH',     TMPDIR);
}
if (!defined('DOCUMENTROOTDIR')) {
    define('DOCUMENTROOTDIR', 'public_html');
}
if (!defined('OWNDIR')) {
    define('OWNDIR',          rtrim(realpath(__DIR__.'/../'.DOCUMENTROOTDIR), DIRECTORY_SEPARATOR));
}
if (!defined('MASTERDIR')) {
    define('MASTERDIR',       rtrim(realpath(__DIR__.'/../'.DOCUMENTROOTDIR), DIRECTORY_SEPARATOR));
}
define('ENGINEDIR',           realpath(__DIR__).DIRECTORY_SEPARATOR);
define('CACHE_DIR',           TMPDIR.'.xcache');

define('PICS_CACHE_DIR',      TMPDIR.'.picscache');
define('PICS_CACHE_TIME',     30*24*60*60); // 30 days
define('PICS_MAX_SIZE',       10 * 1024 * 1024); // 10 Gb
define('PICS_MAX_FILES',      10000); // max cached images
