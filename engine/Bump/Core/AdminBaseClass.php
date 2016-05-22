<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 */
namespace Bump\Core;

use Bump\Core\CMS;

class AdminBaseClass
{
    use \Bump\Traits\AdoDB, \Bump\Traits\Context;

    public static $config = null;
    public static $request = null;
    public static $template = null;

    /**
     * @codeCoverageIgnore
     */
    public function defaultAction()
    {
    }

    public function __construct()
    {
        $this->connect();
        self::$config = CMS::Config();
        self::$request = CMS::Request();
        self::$template = \Bump\Template\Twig::getInstance();
    }

    public function call(array $params)
    {
        try {
            if (array_key_exists('_m', $params)) {
                if (!array_key_exists('_a', $params)) {
                    $params['_a'] = 'defaultAction';
                }
                $module = '\\Bump\\Modules\\' . $params['_m'] . '\\' . $params['_m'];
                $action = $params['_a'];
                if (class_exists($module)) {
                    $obj = new $module;
                    if (method_exists($obj, $action)) {
                        if (CMS::Request()->isAjax()) {
                            if (method_exists($obj, 'checkAccess') && !$obj->checkAccess($module)) {
                                return false;
                            }
                        }
                        CMS::Request()->checkCORS();
                        unset($params['_m']);
                        unset($params['_a']);
                        return $obj->$action($params);
                    }
                }
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
        return false;
    }

    // @codeCoverageIgnoreStart
    public function setTpl($name, $value, $overwrite = true)
    {
        self::$template->setTpl($name, $value, $overwrite);
    }

    public function setTplDir($dir)
    {
        self::$template->setTplDir($dir);
    }

    public function forceTplDir($dir)
    {
        self::$template->forceTplDir($dir);
    }

    public function toString($template, $saveDir = null)
    {
        return self::$template->toString($template, $saveDir);
    }

    public function display($template, $saveDir = null)
    {
        return self::$template->display($template, $saveDir);
    }
    // @codeCoverageIgnoreEnd

}
