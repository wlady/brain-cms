<?php

namespace Bump\Modules\Settings\Model;

class Config extends \Bump\AdoDB\ActiveRecord
{

    function __construct()
    {
        parent::__construct('cms_configs');
        $this->belongsTo('cms_config_group', 'g_id');
    }
}
