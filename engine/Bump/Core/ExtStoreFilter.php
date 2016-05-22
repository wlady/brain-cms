<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class ExtStoreFilter
{

    public $property = null;
    public $operator = null;
    public $type = null;
    public $value = null;

    function __construct($property = 'id', $operator = '=', $value = '', $type = 'numeric')
    {
        $this->property = $property;
        $this->operator = $operator;
        $this->value = $value;
        $this->type = $type;
        return $this;
    }

    public function setProperty($property)
    {
        $this->property = $property;
    }

    public function setOperator($operator)
    {
        $this->operator = $operator;
    }

    public function setType($type)
    {
        $this->type = $type;
    }

    public function setValue($value)
    {
        $this->value = $value;
    }

}
