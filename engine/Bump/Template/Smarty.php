<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Template;

/**
 * @codeCoverageIgnore
 */
class Smarty extends Template
{
    use \Bump\Traits\Singleton;

    protected function init()
    {
        parent::init();
        $this->template = new \Smarty();
        $this->template->setTemplateDir($this->tplDir);
        $this->template->setCompileDir(SMARTY_COMPILE_DIR);
        $this->template->setCacheDir(SMARTY_CACHE_DIR);
        $this->template->addPluginsDir(ENGINEDIR . '/plugins_smarty');
        $this->template->cache_lifetime = SMARTY_CACHE_TIME;
        $this->template->compile_check = SMARTY_COMPILE_CHECK;
        $this->template->force_compile = SMARTY_FORCE_COMPILE;
        if (SMARTY_DEBUG) {
            $this->template->debugging = true;
        }
        // skip this filter for CMS
        if (!defined('DEFAULTLAYOUT') && count(\Bump\Core\CMS::Config()->cdns)) {
            $this->template->loadFilter('output', 'cdns');
        }
    }

    protected function toStringValue($template = null, $saveDir = null)
    {
        if (!$template) {
            $template = 'default.tpl';
        }
        $this->assignTpls();
        if ($this->forceDir) {
            $this->template->setTemplateDir($this->forceDir);
            if ($saveDir) {
                $this->forceDir = $this->tplDir;
            }
        }
        return $this->template->fetch($template);
    }

    protected function displayValue($template, $saveDir)
    {
        if (!$template) {
            $template = 'default.tpl';
        }
        $this->assignTpls();
        if ($this->forceDir) {
            $this->template->setTemplateDir($this->forceDir);
            if ($saveDir) {
                $this->forceDir = $this->tplDir;
            }
        }
        return $this->template->display($template);
    }

    protected function assignTpls()
    {
        if (!empty($this->tpls)) {
            foreach ($this->tpls as $var => $val) {
                $this->template->assign($var, $val);
            }
        }
    }

    protected function setTplDirValue($dir)
    {
        $this->tplDir = $dir;
    }

    protected function forceTplDirValue($dir)
    {
        $this->forceDir = $dir;
    }

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
}
