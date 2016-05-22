<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Template;

class Twig extends Template
{
    use \Bump\Traits\Singleton;

    /**
     * @codeCoverageIgnore
     */
    protected function init()
    {
        parent::init();
        \Twig_Autoloader::register();
    }

    protected function getEnvironment($loader)
    {
        $env = new \Twig_Environment($loader, [
            'cache' => TWIG_CACHE_DIR,
            'debug' => TWIG_DEBUG
        ]);
        foreach (\Bump\Core\CMS::Config()->parserExtensions as $ext) {
            $extension = is_object($ext) ? $ext : new $ext;
            $env->addExtension($extension);
        }
        return $env;
    }

    protected function toStringValue($template = null, $saveDir = null)
    {
        if (substr($template, 0, 7) == 'string:') {
            return $this->loadStringResource(substr($template, 7));
        }
        if (substr($template, 0, 1) == '/') {
            $dir = dirname($template);
            $template = basename($template);
        } else if ($this->forceDir) {
            $dir = $this->forceDir;
        } else {
            $dir = $this->tplDir;
        }
        $loader = new \Twig_Loader_Filesystem($dir);
        $this->template = $this->getEnvironment($loader);
        if (!$template) {
            $template = 'default.twig';
        }
        $template = $this->template->loadTemplate($template);
        return $template->render($this->getTplsValue());
    }

    protected function loadStringResource($string)
    {
        $loader = new \Twig_Loader_String();
        $this->template = $this->getEnvironment($loader);
        return $this->template->render($string, $this->getTplsValue());
    }

    /**
     * @codeCoverageIgnore
     */
    protected function displayValue($template, $saveDir)
    {
        return $this->toStringValue($template, $saveDir);
    }

    /**
     * @codeCoverageIgnore
     */
    protected function setTplDirValue($dir)
    {
        $this->tplDir = $dir;
    }

    /**
     * @codeCoverageIgnore
     */
    protected function forceTplDirValue($dir)
    {
        $this->forceDir = $dir;
    }

    /**
     * @codeCoverageIgnore
     */
    protected function getTplsValue()
    {
        return $this->tpls;
    }

    protected function setTplValue($name, $value, $overwrite = true)
    {
        if ($overwrite) {
            $this->tpls[$name] = $value;
        } else {
            $this->tpls[$name] .= $value;
        }
    }

    protected function getTplValue($name)
    {
        return (!empty($this->tpls[$name])) ? $this->tpls[$name] : null;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getExtensions()
    {
        $extPath = '\\Bump\\Template\\TwigExtensions\\';
        $extensions = [];
        foreach (new \DirectoryIterator(__DIR__ . '/TwigExtensions') as $fileinfo) {
            if ($fileinfo->isFile()) {
                $ext = $extPath . $fileinfo->getBasename('.php');
                $extensions[] = new $ext();
            }
        }

        return $extensions;
    }
}
