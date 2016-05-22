<?php

namespace Bump\Modules\Users\Model;

class User extends \Bump\AdoDB\ActiveRecord
{
    public $customFields = [
        'user_modules' => [
            'name' => 'user_modules',
            'type' => 'string',
            'default_value' => ''
        ]
    ];

    public function __construct()
    {
        parent::__construct('cms_users');
        $this->TableBelongsTo('cms_users', 'cms_users_group', 'ug_id', 'group_id');
    }
}
