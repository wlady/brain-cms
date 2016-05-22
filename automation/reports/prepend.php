<?php

class cb
{
    private static $css = null;
    private static $favicon = null;
    private static $bootstrap = null;
    private static $header = true;
    private static $replacement = null;
    private static $filePrepend = null;
    private static $fileContents = null;

    public function __construct()
    {
        $parts = explode('/', $_SERVER['REQUEST_URI']);
        $reportBase = implode('/', array_slice($parts, 0, 3));
        self::$css = $reportBase . '/css/bootstrap.min.css';
        self::$favicon = implode('/', array_slice($parts, 0, 2)) . '/favicon.ico';
        $cssContents = file_get_contents(__DIR__ . '/assets/css/style.css');
        self::$filePrepend = '<div class="headerTop">' . file_get_contents(__DIR__ . '/generated.html') . '</div>';
        self::$fileContents = self::$filePrepend . file_get_contents(__DIR__ . '/menu.html');
        $host = '/';
        $date = date('r');
        if (file_exists(__DIR__. '/.job')) {
            $host = file_get_contents(__DIR__. '/.job');
            $date = date('r', filemtime(__DIR__. '/.job'));
        }
        self::$fileContents = str_replace(['</ul>', '$JOB_URL', '$GENERATED_DATE'], ['<li><a href="' . $reportBase . '">PHPUnit Report</a></li></ul>', $host, $date], self::$fileContents);
        self::checkTest('Text Dox', '/textdox.html', '/textdox.html', '/textdox.html', true, false);
        self::checkTest('PHP Metrics', '/phpmetrics.html', '/phpmetrics.html', '/phpmetrics.html', true, false);
        self::checkTest('JUnit Report', '/junit-report/phpunit-noframes.html', '/junit-report/phpunit-noframes.html', '/junit-report/phpunit-noframes.html', true, false);
        self::checkTest('Allure Report', '/allure-report/', 'allure-report/index.html', '/allure-report/#/graph', true, true);
        self::$replacement = "<body$1><style>" . $cssContents . '</style>' . self::$fileContents;
    }

    private static function checkTest($name, $url, $file, $link, $bootstrap, $header)
    {
        // hide 'header' for allure reports only
        if (stripos($_SERVER['REQUEST_URI'], 'allure-report') !== false) {
            self::$header = true;
        } else {
            self::$header = false;
        }
        if (($pos = stripos($_SERVER['REQUEST_URI'], $url)) !== false) {
            self::$bootstrap = $bootstrap;
            self::$fileContents = str_replace('</ul>',
                '<li><a href="' . $_SERVER['REQUEST_URI'] . '" class="current">' . $name . '</a></li></ul>',
                self::$fileContents);
        } else {
            $parts = explode('/', $_SERVER['REQUEST_URI']);
            array_pop($parts);
            array_shift($parts);
            $dir = '/';
            foreach ($parts as $part) {
                $dir .= $part . '/';
                if (file_exists(dirname($_SERVER['DOCUMENT_ROOT']) . '/automation/' . $dir . $file)) {
                    self::$fileContents = str_replace('</ul>',
                        '<li><a href="' . $dir . $link . '">' . $name . '</a></li></ul>', self::$fileContents);
                    break;
                }
            }
        }
    }

    public static function replace($buffer)
    {
        $buffer = str_replace('<head>', '<head><link rel="shortcut icon" href="' . self::$favicon . '" type="image/vnd.microsoft.icon" />', $buffer);
        if (self::$bootstrap) {
            $buffer = str_replace('</head>', '<link href="' . self::$css . '" rel="stylesheet"></head>', $buffer);
            $buffer = str_replace('<h1 id="title">', '<h1 id="title" style="visibility:hidden">', $buffer);
        }
        if (self::$header) {
            $buffer = str_replace('<header', '<header style="visibility:hidden"', $buffer);
        }
        $pattern = "~<body( .*)?>~i";
        $buffer = preg_replace($pattern, self::$replacement, $buffer);
        return str_replace('</body>', '</div></body>', $buffer);
    }
}

$cb = new cb();
ob_start('cb::replace');
