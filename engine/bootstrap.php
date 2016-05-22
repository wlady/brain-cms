<?php

include 'define.sysdirs.php';

if (!file_exists(TMPDIR)) {
    mkdir(TMPDIR);
}
if (!file_exists(CACHE_DIR)) {
    mkdir(CACHE_DIR);
}
if (!file_exists(PICS_CACHE_DIR)) {
    mkdir(PICS_CACHE_DIR);
}
if (!defined('PATH_SEPARATOR')) {
    define('PATH_SEPARATOR', getenv('COMSPEC') ? ';' : ':');
}

$loader = include_once HOMEDIR.'/vendor/autoload.php';

if (file_exists(HOMEDIR.'/config.local.json')) {
    $_S = json_decode(file_get_contents(HOMEDIR . '/config.local.json'), true);
} else {
    $_S = json_decode(file_get_contents(HOMEDIR . '/config.json'), true);
}
if (!empty($_ENV['OVERRIDES']) && file_exists(SETTINGSDIR.$_ENV['OVERRIDES'])) {
    $tmp = \Bump\Core\YAML::load($_ENV['OVERRIDES'], SETTINGSDIR);
    $_S = array_merge($_S, $tmp);
}

switch ($_S['ErrorReporting']) {
    case 0:
        error_reporting(0);
        break;
    case 1:
        error_reporting(E_ERROR | E_WARNING | E_NOTICE);
        break;
    case 2:
        error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
        break;
    case 3:
        error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_STRICT));
        break;
    case 4:
        error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        break;
    case 5:
        error_reporting(E_ALL ^ E_NOTICE);
        break;
    case 6:
    default:
        error_reporting(E_ALL);
        break;
}

ini_set('magic_quotes_runtime', $_S['MagicQuotes']);

if (isset($_S['TimeZone']) && function_exists('date_default_timezone_set')) {
    date_default_timezone_set($_S['TimeZone']);
}
if (isset($_S['Compression'])) {
    ini_set('zlib.output_compression', intval($_S['Compression']));
}

include 'define.constants.php';

if (defined('INIT_ENV')) {
    return;
}

$ADODB_CACHE_DIR = CACHE_DIR.'/adodb';
if (!file_exists($ADODB_CACHE_DIR)) {
    mkdir($ADODB_CACHE_DIR);
}
$ADODB_COUNTRECS = false;
$ADODB_ASSOC_CASE = 2;
$ADODB_ACTIVE_CACHESECS = MAX_CACHE_TIME;

include_once 'functions.php';

$config = \Bump\Core\CMS::Config();

// save it explicitly
$config->request = $_REQUEST;

if (!file_exists(TWIG_CACHE_DIR)) {
    mkdir(TWIG_CACHE_DIR);
}
$config->template = \Bump\Template\Twig::getInstance();
$config->parserExtensions = $config->template->getExtensions();

$config->picsExtentions = ['png', 'jpg', 'jpeg', 'gif'];
$config->flashExtentions = ['swf', 'swc', 'fla'];
$config->docsExtentions = ['doc', 'xls', 'pdf', 'zip', 'rar', 'arj', 'tar', 'gz'];
$config->mediaExtentions = array_merge($config->picsExtentions, $config->flashExtentions);
$config->generatePages = $_S['GeneratePages'] ? $_S['GeneratePages'] : [];
$config->noncacheable = $_S['Noncached'];
$config->SYSTEM = SYSTEM;
$config->MAINDOMAIN = $config->DOMAIN = MAINDOMAIN;
$config->UNTAILEDDOMAIN = substr(MAINDOMAIN, -1) == '/' ? substr(MAINDOMAIN, 0, -1) : MAINDOMAIN;
$config->BASEURL = $config->UNTAILEDDOMAIN . BASE;
$config->CMSBASEURL = $config->UNTAILEDDOMAIN . CMSBASE;
$config->MASTERDOMAIN = $_S['MasterDomain'] ? \Bump\Tools\Utils::getProtocol() . '://' . $_S['MasterDomain'] : $config->UNTAILEDDOMAIN;

// prepare origins
$mainDomain = rtrim(MAINDOMAIN, '/');
$config->origins = [
    $mainDomain,
    strtr($mainDomain, ['https:' => 'http:', 'http:' => 'https:'])
];

if (isset($_S['Origins'])) {
    if (is_array($_S['Origins'])) {
        $config->origins = array_unique(array_merge($_S['Origins'], $config->origins));
    } elseif (is_string($_S['Origins'])) {
        $config->origins = array_unique(array_merge([$_S['Origins']], $config->origins));
    }
}
if (isset($config->SSLBASEURL) && !empty($config->SSLBASEURL)) {
    $sslBase = $config->SSLBASEURL;
    if (substr($sslBase, -1) == '/') {
        $sslBase = substr($sslBase, 0, -1);
    }
    $config->origins = array_unique(array_merge([$sslBase], $config->origins));
}

// prepare cdns
$config->cdns = [];
if (isset($_S['CDN'])) {
    if (is_array($_S['CDN'])) {
        $config->cdns = array_unique($_S['CDN']);
    } elseif (is_string($_S['CDN'])) {
        $config->cdns = [$_S['CDN']];
    }
}

// prepare external resources
$config->external = [
    'style' => [],
    'script' => [],
];
if (isset($_S['ExternalResources'])) {
    foreach ($_S['ExternalResources'] as $resource) {
        if (in_array($resource['type'], ['style', 'script'])) {
            $config->external[$resource['type']][] = $resource;
        }
    }
}

if (isset($_S['AuthProviders'])) {
    $config->authProviders = new \Bump\Modules\Auth\Auth($_S['AuthProviders']);
}

if ($_S['Cache']) {
    $cacheClass = '\\Bump\\Cache\\' . $_S['Cache'];
    try {
        if (class_exists($cacheClass)) {
            $config->cache = new $cacheClass();
        }
    } catch (\Exception $e) {
        $config->cache = null;
    }
}
if (!$config->cache) {
    $config->cache = new \Bump\Cache\File();
}
// try to use igbinary serializer
$config->serializer = SERIALIZER ? new \Bump\Serializer\Igbinary() : new \Bump\Serializer\Standard();

umask(0002);
