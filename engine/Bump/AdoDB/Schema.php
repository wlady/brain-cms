<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\AdoDB;

abstract class Schema extends \Bump\AdoDB\AdoDB
{
    public $db = null;

    public function __construct()
    {
        $this->db = parent::init();
    }

    protected function detectType($item)
    {
        switch ($item->type) {
            case "int":
            case "smallint":
            case "mediunint":
            case "tinyint":
            case "bigint":
                return "int";
                break;
            case "date":
                return "date";
                break;
            case "datetime":
            case "timestamp":
                return "datetime";
                break;
            default:
                return "string";
                break;
        }
    }

    protected function TableInfo($view = null)
    {
        $model = $view ? $view : $this->model;
        $tableObj = $model->TableInfo();
        if (property_exists($this->model, 'customFields') && is_array($this->model->customFields)) {
            foreach ($this->model->customFields as $field) {
                $o = new \ADOFieldObject();
                $o->name = $field['name'];
                $o->type = $field['type'];
                $o->default_value = $field['default_value'];
                $tableObj->flds[$o->name] = $o;
            }
        }

        return $tableObj;
    }

    protected function parseRequest($view = null, $args)
    {
        $fields = [];
        $flds = $this->getModelFields($view);
        foreach ($flds as $field) {
            if (isset($args[$field->name])) {
                $fields[$field->name] = $this->getReqVar($field->name, $this->detectType($field), $args);
            }
        }

        return $fields;
    }

    protected function collectFields($array, &$fields)
    {
        foreach ((array)$array as $fieldObj) {
            $tmp = [
                'name' => $fieldObj->name,
            ];
            if ($fieldObj->type == 'date') {
                $tmp['dateFormat'] = 'Y-m-d';
            } elseif ($fieldObj->type == 'datetime' || $fieldObj->type == 'timestamp') {
                $tmp['type'] = 'date';
                $tmp['dateFormat'] = 'Y-m-d H:i:s';
            }
            if (isset($fieldObj->default_value)) {
                $tmp['defaultValue'] = var_export($fieldObj->default_value, true);
                if (isset($fieldObj->has_default) && $fieldObj->has_default) {
                    $tmp['defaultValue'] = var_export($fieldObj->has_default, true);
                }
            }
            array_push($fields, (object)$tmp);
        }
    }

    protected function findModelPK($view = null)
    {
        $model = $view ? $view : $this->model;
        $table = $model->TableInfo();
        if ($k = reset($table->keys)) {
            return $k;
        }
        if ($k = reset($table->flds)) {
            return $k->name;
        } else {
            return "id";
        }
    }

    protected function getModelFields(&$view = null)
    {
        $fields = [];
        $tableObj = $this->TableInfo($view);
        $this->collectFields($tableObj->flds, $fields);
        if (is_array($tableObj->_belongsTo)) {
            foreach ($tableObj->_belongsTo as $foreignTable) {
                $this->collectFields($this->db->MetaColumns($foreignTable->_table), $fields);
            }
        }
        if (is_array($tableObj->_hasMany)) {
            foreach ($tableObj->_hasMany as $foreignTable) {
                $this->collectFields($this->db->MetaColumns($foreignTable->_table), $fields);
            }
        }
        $view->flds = $fields;
        return $fields;
    }

    protected function getModelFieldsObj(&$view = null)
    {
        $tableObj = $this->TableInfo($view);
        $fields = $tableObj->flds;
        if (is_array($tableObj->_belongsTo)) {
            foreach ($tableObj->_belongsTo as $name => $foreignTable) {
                $fields += $this->db->MetaColumns($foreignTable->_table);
            }
        }
        if (is_array($tableObj->_hasMany)) {
            foreach ($tableObj->_hasMany as $name => $foreignTable) {
                $fields += $this->db->MetaColumns($foreignTable->_table);
            }
        }
        $view->flds = $fields;

        return $fields;
    }

    protected function getModelFieldsAssoc(&$view = null)
    {
        $tableObj = $this->TableInfo($view);
        $result = $tableObj->flds;
        if (is_array($tableObj->_belongsTo)) {
            foreach ($tableObj->_belongsTo as $name => $foreignTable) {
                $result[$name] = [];
                $result[$name] += $this->db->MetaColumns($foreignTable->_table);
            }
        }
        if (is_array($tableObj->_hasMany)) {
            foreach ($tableObj->_hasMany as $name => $foreignTable) {
                $result[$name] = [];
                $result[$name] += $this->db->MetaColumns($foreignTable->_table);
            }
        }

        return $result;
    }

    protected function getValues(&$row, $model)
    {
        $tableObj = $model->TableInfo();
        foreach ($tableObj->flds as $field => $fieldObj) {
            $row[$field] = $model->$field;
        }
    }

    public function getFieldsMeta()
    {
        $model = $this->view_model ? $this->view_model : $this->model;

        return [
            'totalProperty' => 'results',
            'root' => 'rows',
            'id' => $this->findModelPK($model),
            'fields' => $this->getModelFields($model)
        ];
    }

    public function getFakeFieldsMeta($totalProperty = 'results', $root = 'rows', $id = 'id')
    {
        $fakeFields = [];
        foreach ($this->fake_model->customFields as $field) {
            $o = new \ADOFieldObject();
            $o->name = $field['name'];
            $o->type = $field['type'];
            $o->default_value = $field['default_value'];
            $fakeFields[$o->name] = $o;
        }
        $fields = [];
        $this->collectFields($fakeFields, $fields);

        return [
            'totalProperty' => $totalProperty,
            'root' => $root,
            'id' => $id,
            'fields' => $fields
        ];
    }

    public function getFields()
    {
        if ($this->view_model) {
            return $this->getModelFieldsAssoc($this->view_model);
        } elseif ($this->model) {
            return $this->getModelFieldsAssoc($this->model);
        }
    }

    protected function collectModelFields()
    {
        if ($this->view_model) {
            $this->view_model->flds = $this->getModelFieldsObj($this->view_model);
        } elseif ($this->model) {
            $this->model->flds = $this->getModelFieldsObj($this->model);
        }
    }
}
