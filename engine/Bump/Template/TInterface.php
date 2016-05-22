<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Template;

interface TInterface
{
    public function setTpl($name, $value, $overwrite);

    public function getTpl($name);

    public function getTpls();

    public function setTplDir($dir);

    public function forceTplDir($dir);

    public function saveTplDirs();

    public function restoreTplDirs();

    public function toString($template, $saveDir);

    public function display($template, $saveDir);
}
