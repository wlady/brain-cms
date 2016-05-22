<?php

namespace Bump\Modules\Albums;

use Bump\Core\CMS;

class Albums extends \Bump\Core\Module
{
    protected static $settings = [];
    private $albums = null;
    private $currAlbum = null;

    public function init()
    {
        if ($data = $this->getModuleSettings(get_class())) {
            self::$settings = $data;
        }
        $this->view_model = new Model\View();
        $this->model = new Model\Album();
    }

    public function getSettings()
    {
        return self::$settings;
    }

    protected function _preSaveRow(&$fields)
    {
        $slug = trim($fields['c_slug']);
        if (empty($slug)) {
            $fields['c_slug'] = \Bump\Tools\Utils::makeSlug($fields['c_title']);
        }
    }

    /**
     * @codeCoverageIgnore
     */
    protected function _postDelRow($ids)
    {
        $sql = "DELETE FROM cms_pictures WHERE album_id IN (" . implode(',', $ids) . ")";
        $this->db->Execute($sql);
    }

    public function reorder()
    {
        $response = ["success" => true];
        $result = true;
        $info = 'success_update';
        $ids = $this->getReqVar("order", "json");
        $sql = "UPDATE cms_albums SET c_order=? WHERE c_id=?";
        foreach ($ids as $key => $id) {
            $data = [$key, $id];
            $this->db->Execute($sql, $data);
        }
        return [
            "success" => $result,
            'message' => $info
        ];
    }

    /**
     * @JSDataStore(id:=albums empty:=1)
     */
    public function getAlbumsArray()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [
                [0, CMS::labels()->not_selected]
            ];
        } else {
            $res = [];
        }
        $sql = "SELECT c_id,c_title FROM cms_albums WHERE c_active = 'true' ORDER BY c_title";
        if ($rows = $this->db->GetAll($sql)) {
            foreach ($rows as $row) {
                $res[] = [$row['c_id'], $row['c_title']];
            }
        }
        return $res;
    }
}
