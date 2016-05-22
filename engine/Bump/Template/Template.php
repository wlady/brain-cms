<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Template;

abstract class Template implements TInterface
{

    protected $template = null;
    protected $tpls = [];
    protected $tplDir = null;
    protected $forceDir = null;
    protected $tmpTplDir = null;
    protected $tmpForceTplDir = null;

    /**
     * @codeCoverageIgnore
     */
    protected function init()
    {
        if (empty($this->tplDir)) {
            $this->setTplDir(DOMAINDIR . TEMPLATESDIR);
        }
    }

    public function setTpls($array = [])
    {
        foreach ($array as $name => $value) {
            $this->setTplValue($name, $value);
        }
    }

    /**
     * @codeCoverageIgnore
     */
    public function setTpl($name, $value, $overwrite = true)
    {
        $this->setTplValue($name, $value, $overwrite);
    }

    /**
     * @codeCoverageIgnore
     */
    public function getTpl($name)
    {
        return getTplValue($name);
    }

    public function getTpls()
    {
        return $this->getTplsValue();
    }

    /**
     * @codeCoverageIgnore
     */
    public function setTplDir($dir)
    {
        $this->setTplDirValue($dir);
    }

    /**
     * @codeCoverageIgnore
     */
    public function forceTplDir($dir)
    {
        $this->forceTplDirValue($dir);
    }

    public function saveTplDirs()
    {
        $this->tmpTplDir = $this->tplDir;
        $this->tmpForceTplDir = $this->forceDir;
    }

    public function restoreTplDirs()
    {
        $this->tplDir = $this->tmpTplDir;
        $this->forceDir = $this->tmpForceTplDir;
    }

    /**
     * @codeCoverageIgnore
     */
    public function toString($template = null, $saveDir = null)
    {
        return $this->toStringValue($template, $saveDir);
    }

    /**
     * @codeCoverageIgnore
     */
    public function display($template, $saveDir = null)
    {
        echo $this->displayValue($template, $saveDir);
    }

}
