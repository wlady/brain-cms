<?php

namespace Bump\Modules\UsersGroups\Model;

class UsersGroup extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_users_groups', $pkeysarr, $db, $options);
    }
}
