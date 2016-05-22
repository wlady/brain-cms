<?php

define('DEFAULTLAYOUT', 'bcms7');
define('COMPILEMIN', true);

include_once __DIR__ . '/../../bootstrap.php';

if (CMSSSL && !isset($_SERVER['HTTPS'])) {
    $ch = curl_init();
    curl_setopt_array($ch, [
            CURLOPT_URL            => 'https://' . $_SERVER['HTTP_HOST'] . CMSBASE . 'get-state.php',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => ['state' => true],
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false
        ]
    );
    $res = curl_exec($ch);
    if (!curl_error($ch)) {
        header('Location: https://' . $_SERVER['HTTP_HOST'] . CMSBASE);
        exit;
    } else {
        flog(curl_error($ch));
    }
} else {
    if (!CMSSSL && isset($_SERVER['HTTPS'])) {
        header('Location: http://' . $_SERVER['HTTP_HOST'] . CMSBASE);
        exit;
    }
}

$app = new \Bump\Core\AdminBaseClass();
$app->forceTplDir(__DIR__ . '/tpl/');
$user = \Bump\Core\CMS::User();
$cacheMaxAge = 2592000;
if ($app::$request->getReqVar('get', 'text') == "lang") {
    $data = [
        'bcmsver' => sprintf('"%s"', SYSTEM . ' ' . VERSION)
    ];
    $lang = $user->getLang();
    if (file_exists(__DIR__ . "/lang/" . $lang . ".lng")) {
        $labels = file(__DIR__ . "/lang/" . $lang . ".lng");
        foreach ($labels as $line) {
            $parts = explode(":", $line, 2);
            $data[$parts[0]] = trim($parts[1]);
        }
    }
    $data[sprintf("%s", base64_decode("X3N0Xw"))] = sprintf('"%s"', session_id());
    $app->setTpl('LABELS', $data);
    $app->setTpl('user', $user->getUserLogin());
    $script = $app->toString('lang.twig');
    $packer = new JavaScriptPacker($script);
    $out = $packer->pack();
    header('Content-Type: text/javascript');
    \Bump\Tools\Utils::cacheHeaders('public', $cacheMaxAge, md5($out));
    die($out);
} else {
    if ($src = $app::$request->getReqVar('min', 'text')) {
        $sources = explode(',', $src);
        $type = $app::$request->getReqVar('type', 'text');
        if (!in_array($type, ['css', 'javascript'])) {
            $type = "javascript";
        }
        if ($type == 'javascript') {
            ob_start();
            foreach (explode(',', $src) as $source) {
                include __DIR__ . "/" . $source;
            }
            $buf = ob_get_contents();
            ob_end_clean();
            if ($app::$request->getReqVar('debug', 'int')) {
                $out = $buf;
            } else {
                $packer = new JavaScriptPacker($buf);
                $out = $packer->pack();
            }
        } else {
            ob_start();
            foreach (explode(',', $src) as $source) {
                include __DIR__ . "/{$source}";
            }
            $str = ob_get_contents();
            ob_end_clean();
            $out = \Bump\Tools\Utils::compress($str);
        }
        header("Content-Type: text/" . $type);
        \Bump\Tools\Utils::cacheHeaders('public', $cacheMaxAge, md5($out));
        die($out);
    }
}
// ajax requests to modules goes here
if ($app::$request->isAjax() && ($mod = $app::$request->getReqVar('_m',
        'text')) && ($act = $app::$request->getReqVar('_a', 'text'))
) {
    try {
        $res = $app->call($_REQUEST);
    } catch (\Exception $e) {
        $res = [
            'success' => false,
            'message' => $e->getMessage(),
        ];
    }

    if (!is_array($res) && !$res) {
        $res = [
            'success' => false,
            'message' => 'Bad request.',
        ];
    }
    header("Content-Type: text/json");
    die(json_encode($res));

}
if (!$user->isRegistered()) {
    $app->setTpl('CONFIG', $app::$config);
    $app->display('index.twig');
    exit;
}
// all other requests to modules
if ($app::$request->getReqVar('_m', 'text') && $app::$request->getReqVar('_a', 'text')) {
    try {
        $res = $app->call($_REQUEST);
    } catch (\Exception $e) {
        $res = [
            'success' => false,
            'message' => $e->getMessage(),
        ];
    }

    if (!is_array($res) && !$res) {
        $res = [
            'success' => false,
            'message' => 'Bad request.',
        ];
    }
    header("Content-Type: text/json");
    die(json_encode($res));
}

if (!$_COOKIE['entryPoint']) {
    $_COOKIE['entryPoint'] = $_SERVER['REQUEST_URI'];
}
$session = \Bump\Core\CMS::Session();

if (file_exists(__DIR__ . '/docs.json')) {
    $app->setTpl('DOCS', json_decode(file_get_contents(__DIR__ . '/docs.json'), true));
}

$_R = [];
if (file_exists(__DIR__ . '/resources.local.json')) {
    $_R = json_decode(file_get_contents(__DIR__ . '/resources.local.json'), true);
} else {
    $_R = json_decode(file_get_contents(__DIR__ . '/resources.json'), true);
}
$ind = 0;
foreach ($_R as &$R) {
    $R['order'] = $ind;
    if (is_array($R['link'])) {
        $ind += count($R['link']);
    } else {
        $ind++;
    }
}

$app->setTpl('USERINFO', sprintf(\Bump\Core\CMS::Labels()->logged, $user->getUserName(), $user->getUserGroup()));
$user->getUserProfile();
$settings = [
    'auth_type'       => $session->getItem('auth_type'),
    'editor'          => $app::$config->currentUser->user_editor,
    'picsExtentions'  => implode(",", $app::$config->picsExtentions),
    'flashExtentions' => implode(",", $app::$config->flashExtentions),
    'mediaExtentions' => implode(",", $app::$config->mediaExtentions),
    'docsExtentions'  => implode(",", $app::$config->docsExtentions),
    'maxFileSize'     => min(\Bump\Tools\Utils::sizeInBytes(ini_get('post_max_size')),
        \Bump\Tools\Utils::sizeInBytes(ini_get('upload_max_filesize')))
];
if (!$app::$config->currentUser->user_layout || !file_exists(__DIR__ . '/ux/layouts/' . $app::$config->currentUser->user_layout . '/layout.twig')) {
    $app::$config->currentUser->user_layout = DEFAULTLAYOUT;
}
if (!$app::$config->currentUser->user_iconsize) {
    $app::$config->currentUser->user_iconsize = DEFAULTICONSIZE;
}
$app->setTpl('CONFIG', $app::$config);
$app->setTpl('SETTINGS', $settings);
$resources = [];
\Bump\Tools\Utils::loadResourceFile(__DIR__ . "/.resources", $resources);
$modulesCl = new \Bump\Modules\Modules\Modules();
$modules = $modulesCl->getUserModules();
$lang = $user->getLang();
$adminLabels = file(__DIR__ . "/lang/" . $lang . ".lng");
$dataStores = [];
$additions = [];
$additionsJS = [];
$additionsCSS = [];
$listModulesNeedInCSS = [];
$panels = [];
$labelVars = ['bcmsver' => '"' . SYSTEM . ' ' . VERSION . '"'];
if (is_array($adminLabels)) {
    foreach ($adminLabels as $line) {
        $line = trim($line);
        if ($line) {
            $parts = explode(":", $line, 2);
            $labelVars[$parts[0]] = trim($parts[1]);
        }
    }
}
if (count($modules)) {
    function getPhrase($hash, $arr)
    {
        foreach ($arr as $line) {
            if (preg_match("~^{$hash}:(.*)~", $line, $mm)) {
                $str = trim($mm[1]);

                return substr($str, 1, -1);
            }
        }
    }

    foreach ($modules as $key => $mods) {
        $name = getPhrase($key, $adminLabels);
        $panels[$key] = [
            'group'   => $key,
            'title'   => $name,
            'modules' => []
        ];
        if ($key == 'domain') {
            $panels[$key]['id'] = 0;
        }
        foreach ($mods as $module) {
            \Bump\Tools\Utils::loadResourceFile(MODULESDIR . $module['m_path'] . "/ux/.resources", $resources);
            if (file_exists(MODULESDIR . $module['m_path'] . "/ux/lang/" . $lang . ".lng")) {
                $moduleLabels = file(MODULESDIR . $module['m_path'] . "/ux/lang/" . $lang . ".lng");
                $name = getPhrase($module['m_path'], $moduleLabels);
                if ($name) {
                    $panels[$key]['modules'][] = [
                        'path' => $module['m_path'],
                        'icon' => $module['iconPath'],
                        'name' => $name
                    ];
                }
            }
            if (file_exists(MODULESDIR . $module['m_path'] . "/ux/lang/" . $lang . ".lng")) {
                $labels = file(MODULESDIR . $module['m_path'] . "/ux/lang/" . $lang . ".lng");
                foreach ($labels as $line) {
                    $line = trim($line);
                    if ($line) {
                        $parts = explode(":", $line, 2);
                        $labelVars[$parts[0]] = trim($parts[1]);
                    }
                }
            }
            if ($module['m_path'] !== 'Admin') {
                // collect others
                if (file_exists(MODULESDIR . $module['m_path'] . "/ux/tpl/addition.php")) {
                    include_once(MODULESDIR . $module['m_path'] . "/ux/tpl/addition.php");
                }
                if (file_exists(MODULESDIR . $module['m_path'] . "/ux/tpl/addition.twig")) {
                    $additions[] = $app->toString(MODULESDIR . $module['m_path'] . "/ux/tpl/addition.twig");
                }
                if (file_exists(MODULESDIR . $module['m_path'] . "/ux/tpl/addition-js.twig")) {
                    $additionsJS[] = $app->toString(MODULESDIR . $module['m_path'] . "/ux/tpl/addition-js.twig");
                }
                if (file_exists(MODULESDIR . $module['m_path'] . "/ux/tpl/addition-css.twig")) {
                    $additionsCSS[] = $app->toString(MODULESDIR . $module['m_path'] . "/ux/tpl/addition-css.twig");
                }
            }
        }
    }
}
$app->setTpl('ADDITIONS', $additions);
ksort($panels);
$app->setTpl('PANELS', $panels);
// build resources
$resPrepared = [
    'top'    => [],
    'middle' => [],
    'bottom' => []
];
$resSources = [
    'top'    => [],
    'middle' => [],
    'bottom' => []
];
$debug = $app::$config->currentUser->user_debug === 'true';
foreach (array_unique($resources) as $res) {
    $resource = trim($res);
    if (array_key_exists($resource, $_R)) {
        $link = $_R[$resource]['link'];
        $compress = $_R[$resource]['compress'];
        $links = [];
        if (is_string($link)) {
            $links = (array)$link;
        } else {
            if (is_array($link)) {
                $links = $link;
            }
        }
        foreach ($links as $key => $link) {
            $readyLink = $app->toString("string:" . $link);
            $app->setTpl('link', $readyLink);
            switch ($_R[$resource]['type']) {
                case 'css':
                    if ($debug) {
                        $resPrepared[$_R[$resource]['position']][$_R[$resource]['order'] + $key] = $app->toString(__DIR__ . "/tpl/resource-css.twig");
                    }
                    if ($compress) {
                        $resSources[$_R[$resource]['position']]['css'][$_R[$resource]['order'] + $key] = $readyLink;
                    } else {
                        $resSources[$_R[$resource]['position']]['cssnc'][$_R[$resource]['order'] + $key] = $readyLink;
                    }
                    break;
                case 'javascript':
                case 'js':
                default:
                    if ($debug) {
                        $resPrepared[$_R[$resource]['position']][$_R[$resource]['order'] + $key] = $app->toString(__DIR__ . "/tpl/resource-js.twig");
                    }
                    if ($compress) {
                        $resSources[$_R[$resource]['position']]['js'][$_R[$resource]['order'] + $key] = $readyLink;
                    } else {
                        $resSources[$_R[$resource]['position']]['jsnc'][$_R[$resource]['order'] + $key] = $readyLink;
                    }
                    break;
            }
        }
    }
}
if (!$debug) {
    $compilledResources = [];
    foreach ($resSources as $place => $data) {
        if (!array_key_exists($place, $compilledResources)) {
            $compilledResources[$place] = [];
        }
        foreach ($data as $type => $files) {
            ksort($files);
            if ($type == 'css' && count($files)) {
                if (COMPILEMIN) {
                    $app->setTpl('link', '?type=css&min=' . $app->toString("string:" . implode(',', $files)));
                    $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-css.twig");
                } else {
                    foreach ($files as $file) {
                        $app->setTpl('link', '?type=css&min=' . $file);
                        $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-css.twig");
                    }
                }
            } else {
                if ($type == 'js' && count($files)) {
                    if (COMPILEMIN) {
                        $app->setTpl('link',
                            '?type=javascript&min=' . $app->toString("string:" . implode(',', $files)));
                        $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-js.twig");
                    } else {
                        foreach ($files as $file) {
                            $app->setTpl('link', '?type=javascript&min=' . $file);
                            $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-js.twig");
                        }
                    }
                } else {
                    if ($type == 'cssnc' && count($files)) {
                        foreach ($files as $link) {
                            $app->setTpl('link', $app->toString("string:" . $link));
                            $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-css.twig");
                        }
                    } else {
                        if ($type == 'jsnc' && count($files)) {
                            foreach ($files as $link) {
                                $app->setTpl('link', $app->toString("string:" . $link));
                                $compilledResources[$place][] = $app->toString(__DIR__ . "/tpl/resource-js.twig");
                            }
                        }
                    }
                }
            }
        }
    }
    $app->setTpl('RESOURCES', $compilledResources);
} else {
    foreach ($resPrepared as $key => &$R) {
        ksort($R);
    }
    $app->setTpl('RESOURCES', $resPrepared);
}
// build data stores
$modules = $modulesCl->getActiveModules();
if (count($modules)) {
    foreach ($modules as $module) {
        \Bump\Tools\Utils::getJSDataStore('\\Bump\\Modules\\' . $module['m_path'] . '\\' . $module['m_path'],
            $dataStores);
    }
}
foreach ($modulesCl->modules as $key => $item) {
    if (file_exists(MODULESDIR . $item['Path'] . '/ux/tpl/style.css')) {
        array_push($listModulesNeedInCSS, $item);
    }
}
$app->setTpl('DATASTORES', $dataStores);
$app->setTpl('LABEL', \Bump\Core\CMS::Labels()->getLabels());
$app->setTpl('MODULES_DATA', $modules = $modulesCl->getModulesArray());
$app->setTpl('USER_MODULES_DATA', $modules = $modulesCl->getUserModulesArray());
$app->setTpl('ALL_USER_MODULES', $listModulesNeedInCSS);
if (file_exists(__DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/layout.php")) {
    include __DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/layout.php";
}
// generated JS & CSS files for all modules
if (($generate = $app::$request->getReqVar('modules', 'text'))) {
    if ($generate == 'js') {
        $app->forceTplDir(__DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/");
        $app->setTpl('JS', $additionsJS);
        header("Content-Type: text/javascript");
        if ($debug) {
            $out = $app->toString('modules-js.twig');
        } else {
            $script = $app->toString('modules-js.twig');
            $packer = new JavaScriptPacker($script);
            $out = $packer->pack();
        }
        \Bump\Tools\Utils::cacheHeaders('public', $cacheMaxAge, md5($out));
        die($out);
    } else {
        if ($generate == 'css') {
            $app->forceTplDir(__DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/");
            $app->setTpl('CSS', $additionsCSS);
            if (file_exists(__DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/modules-" . $app::$config->currentUser->user_theme . "-css.twig")) {
                $str = $app->toString('modules-' . $app::$config->currentUser->user_theme . '-css.twig');
            } else {
                $str = $app->toString('modules-css.twig');
            }
            if ($debug) {
                $out = $str;
            } else {
                $out = \Bump\Tools\Utils::compress($str);
            }
            header("Content-Type: text/css");
            \Bump\Tools\Utils::noCacheHeaders();
            die($out);
        } else {
            if ($generate == 'lng') {
                // lng file have to be obfuscated
                $labelVars[sprintf("%s", base64_decode("X3N0Xw"))] = sprintf('"%s"', session_id());
                $app->setTpl('LABELS', $labelVars);
                $app->setTpl('user', $user->getUserLogin());
                $script = $app->toString(__DIR__ . '/tpl/lang.twig');
                if ($debug) {
                    $out = $script;
                } else {
                    $packer = new JavaScriptPacker($script);
                    $out = $packer->pack();
                }
                header('Content-Type: text/javascript');
                \Bump\Tools\Utils::cacheHeaders('public', $cacheMaxAge, md5($out));
                die($out);
            }
        }
    }
}
$app->forceTplDir([
    __DIR__ . '/tpl/',
    __DIR__ . "/ux/layouts/" . $app::$config->currentUser->user_layout . "/"
]);
$app->display('layout.twig');
