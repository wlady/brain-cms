<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\AdoDB;

class ActiveRecord extends \ADODB_Active_Record
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct($table, $pkeysarr, $db, $options);
    }

    public function Fetch($where = null, $bindarr = false, $all = true)
    {
        $db = $this->DB();
        if (!$db) {
            return false;
        }
        $this->_where = $where;

        $save = $db->SetFetchMode(ADODB_FETCH_ASSOC);
        $qry = "SELECT SQL_CALC_FOUND_ROWS * FROM " . $this->_table;
        $table = &$this->TableInfo();
        if (($k = reset($table->keys))) {
            $hasManyId = $k;
        } else {
            $hasManyId = 'id';
        }
        foreach ($table->_belongsTo as $foreignTable) {
            if (($k = reset($foreignTable->TableInfo()->keys))) {
                $belongsToId = $k;
            } else {
                $belongsToId = 'id';
            }
            $qry .= ' LEFT JOIN ' . $foreignTable->_table . ' ON ' .
                $this->_table . '.' . $foreignTable->foreignKey . '=' .
                $foreignTable->_table . '.' . $belongsToId;
        }
        foreach ($table->_hasMany as $foreignTable) {
            $qry .= ' LEFT JOIN ' . $foreignTable->_table . ' ON ' .
                $this->_table . '.' . $hasManyId . '=' .
                $foreignTable->_table . '.' . $foreignTable->foreignKey;
        }
        if ($where) {
            $qry .= ' WHERE ' . $where;
        }
        if ($all) {
            $rows = $db->GetAll($qry, $bindarr);
            if (!$rows) {
                return array(array(), 0);
            }
            $db->SetFetchMode($save);
            $total = $db->GetOne("SELECT FOUND_ROWS()");

            return array($rows, $total);
        } else {
            return $db->GetRow($qry, $bindarr);
        }
    }
}
