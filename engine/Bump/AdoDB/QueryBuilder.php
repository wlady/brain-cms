<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\AdoDB;

abstract class QueryBuilder extends Schema
{
    public function __construct()
    {
        parent::__construct();
    }

    /*
    * Filters can be ganerated in php to different arguments (_filter & filter)
    *
    * 1) '_filter' should be an array (see Ext.ux.grid.filter.Filter)
    *	$filters = array(
    *		array(
    *			'field' => 'code',
    *			'data'  => array(
    *				'type'  => 'list',
    *				'value' => '01,JS,1C'
    *			)
    *		)
    *	);
    *	$rooms = $app->call([
    *		'_m'      => 'rooms',
    *		'_a'      => 'getRows',
    *		'_filter' => json_encode($filters)
    *	]);
    *
    * 2) 'filter' should be an object (see Ext.data.Operation @filters)
    *
    *	$filters[] = new ExtStoreFilter('m_levels', '=', array_keys($groups), 'set');
    *	$modules = $app->call([
    *		'_m'     => 'modules',
    *		'_a'     => 'getRows',
    *		'filter' => json_encode($filters)
    *	]);
    */
    public function gridFilteredWhereClause($model, $filters)
    {
        $operations = [
            'eq' => '=',
            'lt' => '<',
            'gt' => '>',
            'le' => '<=',
            'ge' => '>=',
        ];
        $whereFields = [];
        $whereBinds = [];
        foreach ($filters as $filter) {
            if (is_array($filter)) {
                $op = array_key_exists($filter['data']['comparison'],
                    $operations) ? $operations[$filter['data']['comparison']] : '=';
                $field = $filter['field'];
                $value = $filter['data']['value'];
                $format = $filter['data']['format'];
                $type = $filter['data']['type'];
            } elseif (is_object($filter)) {
                $op = isset($filter->operator) ? $filter->operator : '=';
                $field = $filter->property;
                $value = $filter->value;
                $format = "";
                $type = isset($filter->type) ? $filter->type : 'numeric';
            }
            switch ($type) {
                case 'numeric':
                    if (strpos($field, '.') === false) {
                        $whereFields[] = sprintf("`%s` %s ?", $field, $op);
                    } else {
                        $whereFields[] = sprintf("%s %s ?", $field, $op);
                    }
                    $whereBinds[] = $value;
                    break;
                case 'date':
                    if (!$format) {
                        $format = "%Y-%m-%d";
                    }
                    if (strpos($field, '.') === false) {
                        $whereFields[] = "DATE_FORMAT(`{$field}`,'{$format}') {$op} ?";
                    } else {
                        $whereFields[] = "DATE_FORMAT({$field},'{$format}') {$op} ?";
                    }
                    $whereBinds[] = date(str_replace("%", "", $format), strtotime($value));
                    break;
                case 'string':
                    $whereFields[] = sprintf("`%s` LIKE ?", $field);
                    $whereBinds[] = "%{$value}%";
                    break;
                case 'boolean':
                    if (strpos($field, '.') === false) {
                        $whereFields[] = "`{$field}` = ?";
                    } else {
                        $whereFields[] = "{$field} = ?";
                    }
                    $whereBinds[] = $value;
                    break;
                case 'list':
                    if (strlen($value)) {
                        $parts = explode(',', $value);
                        if (strpos($field, '.') === false) {
                            $whereFields[] = "`{$field}` IN (" . implode(",", array_fill(0, count($parts), '?')) . ")";
                        } else {
                            $whereFields[] = "{$field} IN (" . implode(",", array_fill(0, count($parts), '?')) . ")";
                        }
                        $whereBinds = array_merge($whereBinds, $parts);
                    }
                    break;
                case 'set':
                    $tmp = [];
                    foreach ((array)$value as $val) {
                        if (strpos($field, '.') === false) {
                            $tmp[] = "FIND_IN_SET(?, `{$field}`)";
                        } else {
                            $tmp[] = "FIND_IN_SET(?, {$field})";
                        }
                        $whereBinds[] = $val;
                    }
                    $whereFields[] = "(" . implode(" OR ", $tmp) . ")";
                    break;
            }
        }

        return [implode(" AND ", $whereFields), $whereBinds];
    }

    public function buildModelWhereClause($model, $filters)
    {
        $whereFields = [1];
        $whereBinds = [];
        $fields = $model->getAttributeNames();
        foreach ($filters as $name => $value) {
            if (in_array($name, $fields)) {
                $whereFields[] = "{$model->_table}.`$name` = ?";
                $whereBinds[] = $value;
            }
        }

        return [implode(" AND ", $whereFields), $whereBinds];
    }
}
