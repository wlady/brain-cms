<?php

namespace Bump\Modules\EmailLogs\Model;

class EmailLog extends \Bump\AdoDB\ActiveRecord
{

    function __construct()
    {
        parent::__construct('cms_email_logs');
        $this->belongsTo('cms_email_form', 'form_id');
    }
}
