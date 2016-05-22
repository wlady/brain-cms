<?php

namespace Bump\Modules\Settings\Model;

class Group extends \Bump\AdoDB\ActiveRecord
{

    function __construct()
    {
        parent::__construct('cms_config_groups');
        $this->hasMany('cms_config', 'g_id');
    }
}
