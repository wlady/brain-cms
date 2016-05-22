<?php

namespace Bump\Modules\SysInfo;

use \Bump\Core\CMS;

class SysInfo extends \Bump\Core\Module
{
    protected static $settings = [];
    protected static $components = null;
    protected static $packages = null;
    protected static $system = null;

    public function init()
    {
        if ($data = self::getModuleSettings(get_class())) {
            self::$settings = $data;
        }
        self::prepareData();
    }

    protected function prepareData()
    {
        $phpinfo = $system = $host = $kernel = '';
        if (file_exists(HOMEDIR . "/components.json")) {
            self::$components = json_decode(file_get_contents(HOMEDIR . "/components.json"));
        }
        if (file_exists(HOMEDIR . "/composer.lock")) {
            self::$packages = json_decode(file_get_contents(HOMEDIR . "/composer.lock"));
        }
        if (self::$settings['phpinfo']) {
            ob_start();
            phpinfo();
            $phpinfo = ob_get_contents();
            ob_end_clean();
        }
        // @codeCoverageIgnoreStart
        if (preg_match('|<table[^<]*>\s+?<tr><td class="e">System\s+?</td><td class="v">([^<]*)</td></tr>|si',
            $phpinfo, $mm)) {
            list($system, $host, $kernel) = preg_split('/[\s,]+/', $mm[1], 5);
        } else {
            list($system, $host, $kernel) = preg_split('/[\s,]+/',
                @exec('uname -a'), 5);
        }
        if (empty($host)) {
            $host = $_SERVER['HTTP_HOST'];
        }
        $dbVersion = $this->db->ServerInfo();
        $dbVersion['name'] = _adodb_getdriver($this->db->dataProvider, $this->db->databaseType);
        if (empty($system)) {
            $system = 'Unknown';
        }
        // @codeCoverageIgnoreEnd
        self::$system = [
            'this' => SYSTEM,
            'version' => VERSION,
            'date' => date('r'),
            'system' => $system,
            'kernel' => $kernel,
            'host' => $host,
            'ip' => (boolean)self::$settings['resolve'] ? gethostbyname($host) : '',
            'uptime' => @exec('uptime'),
            'http_server' => str_replace('/', '/ ', $_SERVER['SERVER_SOFTWARE']),
            'php' => phpversion(),
            'zend' => (function_exists('zend_version') ? zend_version() : ''),
            'db_server' => DB_SERVER,
            'db_ip' => self::$settings['resolve'] == 'true' ? gethostbyname(DB_SERVER) : '',
            'db_version' => $dbVersion,
            'client_ua' => $_SERVER['HTTP_USER_AGENT'],
            'client_role' => CMS::User()->getUserGroup()
        ];
        $res = [];
        exec('svn info ' . HOMEDIR, $res);
        $info = implode(' ', $res);
        if (preg_match_all('/Last Changed Rev:\s+(.*?) /si', $info, $mm)) {
            self::$system['rev_num'] = 'svn rev: ' . $mm[1][0] . ';';
        }
        if (preg_match_all('/Last Changed Date:\s+(.*?)\((.*?) /si', $info, $mm)) {
            self::$system['rev_date'] = trim($mm[1][0]);
        }
        $phpinfo = preg_replace('~<style[^>]*>(.*)</style>~is', "", $phpinfo);
        if ($phpinfo) {
            self::$system['phpinfo'] = $phpinfo;
        }
    }

    public function getInfo()
    {
        $template = CMS::Config()->template;
        $template->forceTplDir(__DIR__ . '/ux/tpl/');
        $template->setTpl('COMPONENTS', self::$components);
        $template->setTpl('PACKAGES', self::$packages);
        $template->setTpl('DATA', self::$system);
        return [
            'success' => true,
            'message' => $template->toString()
        ];
    }

    /**
     * This is a test method
     *
     * @AccessLevel(0,100)
     * @throws \Exception
     * @codeCoverageIgnore
     */
    public function throwException()
    {
        throw new \Exception('phpunittest');
    }
}
