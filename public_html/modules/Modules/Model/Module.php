<?php

namespace Bump\Modules\Modules\Model;

class Module extends \Bump\AdoDB\ActiveRecord
{
    public $customFields = [
        'iconPath' => [
            'name' => 'iconPath',
            'type' => 'string',
            'default_value' => ''
        ],
        'Group' => [
            'name' => 'Group',
            'type' => 'string',
            'default_value' => ''
        ],
        'Version' => [
            'name' => 'Version',
            'type' => 'string',
            'default_value' => ''
        ],
        'Status' => [
            'name' => 'Status',
            'type' => 'string',
            'default_value' => 'active'
        ],
        'Depends' => [
            'name' => 'Depends',
            'type' => 'string',
            'default_value' => ''
        ],
        'Author' => [
            'name' => 'Author',
            'type' => 'string',
            'default_value' => ''
        ],
        'Publisher' => [
            'name' => 'Publisher',
            'type' => 'string',
            'default_value' => ''
        ],
        'Settings' => [
            'name' => 'Settings',
            'type' => 'string',
            'default_value' => ''
        ]
    ];

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_modules');
    }
}
