<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class CacheDependency extends \Bump\Core\BaseHandler implements ICacheDependency
{

    private $data = null;

    public function evaluateDependency()
    {
        $this->data = $this->generateDependentData();
    }

    public function getHasChanged()
    {
        return $this->generateDependentData() != $this->data;
    }

    public function getDependentData()
    {
        return $this->data;
    }

    protected function generateDependentData()
    {
        return null;
    }
}
