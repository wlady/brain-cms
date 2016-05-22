<?php

namespace Bump\Modules\Mailchimp\Model;

class MailchimpMember extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_mailchimp_members', $pkeysarr, $db, $options);
    }

}
