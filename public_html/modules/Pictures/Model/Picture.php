<?php

namespace Bump\Modules\Pictures\Model;

class Picture extends \Bump\AdoDB\ActiveRecord
{
    public $customFields = [
        'filename' => [
            'name' => 'filename',
            'type' => 'string',
            'default_value' => ''
        ],
        'size' => [
            'name' => 'size',
            'type' => 'int',
            'default_value' => 0
        ],
        'width' => [
            'name' => 'width',
            'type' => 'string',
            'default_value' => ''
        ],
        'height' => [
            'name' => 'height',
            'type' => 'string',
            'default_value' => ''
        ],
        'dims' => [
            'name' => 'dims',
            'type' => 'string',
            'default_value' => ''
        ],
        'url' => [
            'name' => 'url',
            'type' => 'string',
            'default_value' => ''
        ],
        'iconUrl' => [
            'name' => 'iconUrl',
            'type' => 'string',
            'default_value' => ''
        ],
        'cls' => [
            'name' => 'cls',
            'type' => 'string',
            'default_value' => ''
        ]
    ];

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_pictures', $pkeysarr, $db, $options);
    }
}
