<?php

namespace Bump\Modules\Forms\Model;

class Form extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_forms', $pkeysarr, $db, $options);
    }
}
