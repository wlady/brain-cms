<?php

namespace Bump\Modules\EmailForms\Model;


class EmailForm extends \Bump\AdoDB\ActiveRecord
{
    public function __construct($table = false, $pkeysarr = false, $db = false, $options = [])
    {
        parent::__construct('cms_email_forms', $pkeysarr, $db, $options);
    }
}
