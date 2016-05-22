<?php

namespace Bump\Modules\Routes\Model;

class Route extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_routes', $pkeysarr, $db, $options);
    }

}

