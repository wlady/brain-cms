<?php

define('MAINDOMAIN',           $_S['Domain']);
define('BASE',                 $_S['Base'] ? $_S['Base'] : '/');
define('CMSBASE',              $_S['CMSBase'] ? $_S['CMSBase'] : '/admin/');
define('CMSSSL',               $_S['CMSSSL'] ? boolval($_S['CMSSSL']) : false);
define('SYSTEM',               $_S['Title']);
define('VERSION',              $_S['Version']);
define('AUTHOR',               is_array($_S['Author']) ? implode(', ', $_S['Author']) : $_S['Author']);
define('DEFAULT_LANGUAGE',     ucfirst($_S['Lang']));
define('DEBUG',                $_S['Debug']);
define('DB_SERVER',            $_S['DB']['Server']);
define('DB_PORT',              $_S['DB']['Port']);
define('DB_USER',              $_S['DB']['User']);
define('DB_PASSWORD',          $_S['DB']['Password']);
define('DB_SCHEMA',            $_S['DB']['Schema']);
define('DB_PLATFORM',          $_S['DB']['Platform']);
if (!defined('DOMAINDIR')) {
    if ($_SERVER['DOCUMENT_ROOT']) {
        define('DOMAINDIR',    str_replace('//', '/', $_SERVER['DOCUMENT_ROOT']));
    } else {
        define('DOMAINDIR',    str_replace('//', '/', HOMEDIR.'/'.DOCUMENTROOTDIR.'/'));
    }
}
define('TEMPLATESDIR',         $_S['Paths']['Templates']);
define('MODULES',              $_S['Paths']['Modules']);
define('MODULESDIR',           MASTERDIR.MODULES);
define('UPLOADPATH',           $_S['Paths']['UploadPath']);
define('UPLOADDIR',            MASTERDIR.UPLOADPATH);
define('IMG_DIR',              $_S['Paths']['ImagesDir']);
define('IMG_LIBRARY',          str_replace('//', '/', UPLOADDIR.IMG_DIR));
define('FLASH_DIR',            $_S['Paths']['FlashDir']);
define('FLASH_LIBRARY',        str_replace('//', '/', UPLOADDIR.FLASH_DIR));
define('DOCS_DIR',             $_S['Paths']['FilesDir']);
define('DOCS_LIBRARY',         str_replace('//', '/', UPLOADDIR.DOCS_DIR));
define('MEDIA_DIR',            $_S['Paths']['MediaDir']);
define('MEDIA_LIBRARY',        str_replace('//', '/', UPLOADDIR.MEDIA_DIR));

define('TITLESEPARATOR',       ' :: ');
define('BREADCRUMBSEPARATOR',  ' &mdash; ');
define('INACTIVITY_TIMEOUT',   1800); // 30 mins

define('A_DAY_CACHE_TIME',     86400);
define('MAX_CACHE_TIME',       3600); // default cache limits for mysql requests - 3600 secs = 1 hour
define('HALF_HOUR_CACHE_TIME', 1800); // 30 mins
define('MIN_CACHE_TIME',       600);
define('TZ_OFFSET',            date('P'));

define('SERIALIZER',           extension_loaded('igbinary'));

if (isset($_S['Executables'])) {
    if (isset($_S['Executables']['ffmpeg'])) {
        define('FFMPEG', $_S['Executables']['ffmpeg']);
    }
    if (isset($_S['Executables']['ffprobe'])) {
        define('FFPROBE', $_S['Executables']['ffprobe']);
    }
}

define('DEFAULTTEMPLATE',      'page.default.twig');
define('TWIG_CACHE_DIR',       CACHE_DIR.$_S['Twig']['CacheDir']);
define('TWIG_DEBUG',           $_S['Twig']['Debug']);

define('DOMPDF_ENABLE_AUTOLOAD', false);

define('FLOG',                   TMPDIR.'/log.txt');
