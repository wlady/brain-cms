<?php

namespace Bump\Modules\FormFields;

class FormFields extends \Bump\Core\Module
{
    private static $types = [
        'text' => 'Text',
        'variable' => 'Alpha Numeric',
        'alpha' => 'Clear Words',
        'email' => 'Email Address',
        'url' => 'FQDN URL',
        'date' => 'Date',
        'time' => 'Time',
        'datetime' => 'Mysql Date Time',
        'ip' => 'IP Address',
        'integer' => 'Integer',
        'float' => 'Float',
        'number' => 'Numeric',
        'ccard' => 'Credir Card Number',
        'boolean' => 'Boolean',
        'checkbox' => 'Checkbox',
        'array' => 'Array',
        'json' => 'JSON',
        'string' => 'String (any symbol)'
    ];

    public function init()
    {
        $this->model = new Model\FormField();
    }

    public function getFields()
    {
        // public wrapper
        $args = func_get_arg(0);
        return $this->getRows($args);
    }

    public function getTypes()
    {
        return self::$types;
    }

    public function getTypesLabels()
    {
        $res = [];
        foreach (self::$types as $type => $label) {
            $res[] = [$type, $label];
        }
        return $res;
    }
}
