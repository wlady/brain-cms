<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

interface ICacheDependency
{
    public function evaluateDependency();

    public function getHasChanged();
}
