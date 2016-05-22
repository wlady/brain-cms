<?php

namespace Bump\Modules\EmailAttachments\Model;

class EmailAttachment extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_email_attachments', $pkeysarr, $db, $options);
    }
}
