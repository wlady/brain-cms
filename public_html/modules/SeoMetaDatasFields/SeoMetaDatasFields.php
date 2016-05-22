<?php

namespace Bump\Modules\SeoMetaDatasFields;

use Bump\Core\CMS;

class SeoMetaDatasFields extends \Bump\Core\Module
{
    private static $types = [
        'textfield' => 'Text',
        'textareafield' => 'Text Area',
        // custom components - should exist in Ext.ux.form.field
        'enumtruefalsecombo' => 'True/False Combo',
        'cachecontrolcombo' => 'HTTP Cache Control',
        'cachetimecombo' => 'HTTP Cache Time'
    ];

    public function init()
    {
        $this->model = new Model\SeoMetaDatasField();
    }

    protected function _postGetRows(&$rows)
    {
        if ($this->getReqVar('clear', 'int')) {
            return;
        }
        foreach ($rows as &$row) {
            $row['f_xname'] = 'f_x' . $row['f_xname'];
        }
    }

    public function delRow()
    {
        $args = func_get_arg(0);
        $ids = $this->getReqVar("id", "json", $args);
        $sql = "DELETE FROM cms_seometadatas_fields WHERE `id` IN (" . implode(',', $ids) . ") AND `custom`!='false'";
        $res = $this->db->Execute($sql);
        if ($this->isAjax()) {
            return ['success' => $res !== false];
        } else {
            return $res !== false;
        }
    }

    public function getTypes()
    {
        return self::$types;
    }

    /**
     * @JSDataStore(id:=seoMetaDataFields)
     * @JSDataStore(id:=seoMetaDataFields2 empty:=1)
     */
    public function getTypesLabels()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [[0, CMS::Labels()->not_selected]];
        } else {
            $res = [];
        }
        foreach (self::$types as $type => $label) {
            $res[] = [$type, $label];
        }
        return $res;
    }

    public function reorder()
    {
        $response = ["success" => true];
        $result = true;
        $info = 'success_update';
        $ids = $this->getReqVar("order", "json");
        $sql = "UPDATE cms_seometadatas_fields SET f_xorder=? WHERE id=?";
        try {
            foreach ($ids as $key => $val) {
                $this->db->Execute($sql, [$key, $val]);
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }

        $this->clearCache();
        return [
            'success' => $result,
            'message' => $info
        ];
    }
}
