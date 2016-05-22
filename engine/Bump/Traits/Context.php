<?php
/**
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package BCMS
 *
 */
namespace Bump\Traits;

trait Context
{

    public function getReqVar($var, $type = '', $input = null, &$found = true)
    {
        return \Bump\Core\CMS::Request()->getReqVar($var, $type, $input, $found);
    }

    public function isAjax()
    {
        return \Bump\Core\CMS::Request()->isAjax();
    }

    public function checkCORS($listOfOrigins)
    {
        return \Bump\Core\CMS::Request()->checkCORS($listOfOrigins);
    }
}
