<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\AdoDB;

class Recordset extends QueryBuilder
{

    use \Bump\Traits\Context;

    public $model = null;
    public $view_model = null;

    public function __construct()
    {
        parent::__construct();
    }

    protected function _preGetRows(&$params)
    {
    }

    protected function _preGetRow(&$params)
    {
    }

    protected function _postGetRows(&$rows)
    {
    }

    protected function _postGetRow(&$row)
    {
    }

    protected function _postLoad(&$row)
    {
    }

    protected function _preSaveRow(&$fields)
    {
    }

    protected function _postSaveRow($fields, $odds)
    {
    }

    protected function _preDelRow(&$ids)
    {
    }

    protected function _postDelRow($ids, $collectedIds)
    {
    }

    public function __get($var)
    {
        return $this->$var;
    }

    protected function getModelRows($where, $binds, $keys)
    {
        $tableObj = $this->model->TableInfo();
        $rows = $this->model->Find($where, $binds, $keys);
        $res = [];
        foreach ($rows as $rowObj) {
            $row = [];
            // check relations
            if (count($tableObj->_belongsTo)) {
                foreach ($tableObj->_belongsTo as $rel => $relObj) {
                    $this->getValues($row, $rowObj->$rel);
                }
            }
            if (count($tableObj->_hasMany)) {
                foreach ($tableObj->_hasMany as $rel => $relObj) {
                    $this->getValues($row, $rowObj->$rel);
                }
            }
            $this->getValues($row, $rowObj);
            $res[] = $row;
        }

        return $res;
    }

    public function getRows()
    {
        $args = func_get_arg(0);
        $model = $this->view_model ? $this->view_model : $this->model;
        $_filters = $this->getReqVar('filter', 'json', $args);
        $_gridFilter = $this->getReqVar('_gridFilter', 'array', $args);
        $_filter = $this->getReqVar('_filter', 'json_array', $args);
        $filters = array_merge((array)$_gridFilter, (array)$_filters, (array)$_filter);

        $this->_preGetRows($filters);
        if (count($filters)) {
            list($where, $binds) = $this->gridFilteredWhereClause($model, $filters);
            list($where2, $binds2) = $this->buildModelWhereClause($model, $args);
            if ($where && $where2) {
                $where .= " AND {$where2}";
                $binds = array_merge($binds, $binds2);
            }
        } else {
            list($where, $binds) = $this->buildModelWhereClause($model, $args);
        }
        if (($sort = $this->getReqVar("sort", "string", $args))) {
            if (is_array($sortObj = json_decode($sort))) {
                foreach ($sortObj as $sort) {
                    $sorts[] = "{$sort->property} {$sort->direction}";
                }
            } else {
                $where .= " ORDER BY $sort ";
                $dir = $this->getReqVar("dir", "string", $args);
                if ($dir) {
                    $where .= " $dir ";
                }
            }
        } elseif (($sortBy = $this->getReqVar("sortBy", "json", $args))) {
            $sorts = [];
            foreach ($sortBy as $sort) {
                $sorts[] = "{$sort->property} {$sort->direction}";
            }
            $where .= " ORDER BY " . implode(',', $sorts);
        }
        if (!$start = $this->getReqVar("start", "int", $args)) {
            $start = 0;
        }
        if (!$limit = $this->getReqVar("limit", "int", $args)) {
            $limit = 20;
        }
        if ($limit > 0) {
            $where .= " LIMIT $start, $limit";
        }
        $res = $model->Fetch($where, $binds);
        if (!is_array($res)) {
            if ($this->isAjax()) {
                return ['success' => false];
            } else {
                return false;
            }
        }
        list($rows, $total) = $res;
        if ($rows) {
            $this->_postGetRows($rows);
        }
        if ($this->isAjax()) {
            return [
                'metaData' => $this->getFieldsMeta(),
                'results' => $total,
                'rows' => $rows,
                'success' => true
            ];
        } else {
            return $rows;
        }
    }

    public function getRow()
    {
        $args = func_get_arg(0);
        $model = $this->view_model ? $this->view_model : $this->model;
        $this->_preGetRow($args);
        list($where, $binds) = $this->buildModelWhereClause($model, $args);
        $row = $model->Fetch($where, $binds, false);
        if (!$row) {
            if ($this->isAjax()) {
                return ['success' => false];
            } else {
                return false;
            }
        }
        $this->_postGetRow($row);
        if ($this->isAjax()) {
            if ($this->getReqVar('metadata', 'int')) {
                return [
                    'metaData' => $this->getFieldsMeta(),
                    'results' => 1,
                    'rows' => array($row),
                    'success' => true
                ];
            } else {
                return [
                    'data' => $row,
                    'success' => true
                ];
            }
        } else {
            return $row;
        }
    }

    public function saveRow()
    {
        $args = func_get_arg(0);
        $model = $this->view_model ? $this->view_model : $this->model;
        $tbl = $this->model->_table;
        $fields = $this->parseRequest($model, $args);
        $pk = $this->findModelPK();
        try {
            $odds = $this->_preSaveRow($fields);
            $result = true;
            $insId = "";
            if ($fields) {
                $this->db->Replace($tbl, $fields, $pk, true);
                $fields['__lastInsertID__'] = $insId = $this->db->Insert_ID();
                $data = $this->_postSaveRow($fields, $odds); // return any data needed in caller
            } else {
                $data = $this->_postSaveRow($fields, $odds);
            }
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
        if ($this->isAjax()) {
            return ['success' => $result, 'id' => $insId, 'data' => $data];
        } else {
            return $result;
        }
    }

    public function saveRec()
    {
        $rec = $this->getReqVar('record', 'json_array');

        return $this->saveRow($rec);
    }

    public function delRow()
    {
        $args = func_get_arg(0);
        $response = ["success" => false];
        $tbl = $this->model->_table;
        $pk = $this->findModelPK();
        $ids = $this->getReqVar("id", "json", $args);
        $key = $this->getReqVar("key", "string", $args);
        $collectedIds = $this->_preDelRow($ids);
        $pk = $key ? $key : $pk;
        $sql = "DELETE FROM $tbl WHERE `$pk` IN (" . implode(',', $ids) . ")";
        $res = $this->db->Execute($sql);
        $this->_postDelRow($ids, $collectedIds);
        if ($this->isAjax()) {
            return ['success' => $res !== false];
        } else {
            return $res !== false;
        }
    }

    public function Load()
    {
        $args = func_get_arg(0);
        $response = ["success" => false];
        list($where, $binds) = $this->buildModelWhereClause($this->model, $args);
        $rows = $this->getModelRows($where, $binds, false);
        if ($rows) {
            $this->_postLoad($rows);
        }
        if ($this->isAjax()) {
            return [
                'metaData' => $this->getFieldsMeta(),
                'results' => 1,
                'rows' => $rows,
                'success' => true
            ];
        } else {
            return $rows;
        }
    }

    protected function clearCache()
    {
        $this->db->CacheFlush();
        \Bump\Core\CMS::Config()->cache->flush();
    }
}
