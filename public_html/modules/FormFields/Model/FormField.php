<?php

namespace Bump\Modules\FormFields\Model;

class FormField extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_form_fields', $pkeysarr, $db, $options);
    }
}
