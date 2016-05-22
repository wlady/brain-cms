<?php

namespace Bump\Modules\SeoMetaDatas;

class SeoMetaDatas extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\SeoMetaData();
    }

    protected function _postGetRows(&$rows)
    {
        // add fake field name to rewrite original request
        $flds = (new \Bump\Modules\SeoMetaDatasFields\SeoMetaDatasFields())->getRows(['fake' => true]);
        $fields = isset($flds['rows']) ? $flds['rows'] : $flds;
        foreach ($rows as &$row) {
            $object = new \stdClass();
            $obj = unserialize($row['data']);
            foreach ($fields as $field) {
                $object->{$field['f_xname']} = $obj->{$field['f_xname']};
            }
            $row['data'] = $object;
        }
    }

    protected function _postGetRow(&$row)
    {
        // add fake field name to rewrite original request
        $flds = (new \Bump\Modules\SeoMetaDatasFields\SeoMetaDatasFields())->getRows(['fake' => true]);
        $fields = isset($flds['rows']) ? $flds['rows'] : $flds;
        $object = new \stdClass();
        $obj = unserialize($row['data']);
        foreach ($fields as $field) {
            $object->{$field['f_xname']} = $obj->{$field['f_xname']};
        }
        $row['data'] = $object;
    }

    protected function _preSaveRow(&$fields)
    {
        if (!isset($fields['data'])) {
            $data = new \stdClass;
            foreach ($_REQUEST as $field => $v) {
                if (preg_match('~^f_x~', $field)) {
                    $value = $this->getReqVar($field, 'string');
                    $data->$field = $value;
                }
            }
            $newFields = [
                'id' => $fields['id'],
                'url' => $fields['url'],
                'data' => serialize($data)
            ];
            $fields = $newFields;
        }
    }

    protected function _postSaveRow($fields, $odds)
    {
        $this->clearCache();
    }

    public function copy()
    {
        $id = $this->getReqVar('id', 'int');
        $sql = 'SELECT * FROM cms_seometadatas WHERE id=?';
        $row = $this->db->getRow($sql, $id);
        $row['url'] .= ' (copy)';
        unset($row['id']);
        try {
            $this->db->Replace('cms_seometadatas', $row, 'id', true);
            return [
                'success' => true,
                'message' => ''
            ];
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
