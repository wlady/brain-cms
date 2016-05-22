<?php

namespace Bump\Modules\UsersWhitelist\Model;

class UsersWhitelist extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_users_profiles', $pkeysarr, $db, $options);
    }

}
