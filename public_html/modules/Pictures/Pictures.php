<?php

namespace Bump\Modules\Pictures;

class Pictures extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\Picture();
    }

    protected function _postGetRows(&$rows)
    {
        $picsLibrary = DOMAINDIR;
        foreach ($rows as &$row) {
            $row['filename'] = $row['size'] = $row['dims'] = $row['width'] = $row['height'] = $row['cls'] = "";
            $row['iconUrl'] = $row['url'] = '/modules/Admin/img/noimage.png';
            if ($row['external'] == 'true' && !empty($row['photo']) && filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                $row['dims'] = "120x90";
                $row['width'] = 120;
                $row['height'] = 90;
                $row['size'] = 0;
                $row['filename'] = $row['photo'];
                $row['url'] = $row['photo'];
                $row['cls'] = 'pointer';
            } elseif (!empty($row['photo']) && file_exists($picsLibrary . $row['photo'])) {
                $size = @getimagesize($picsLibrary . $row['photo']);
                $dims = $size[0] . 'x' . $size[1];
                $row['dims'] = $dims;
                $row['width'] = $size[0];
                $row['height'] = $size[1];
                $row['size'] = filesize($picsLibrary . $row['photo']);
                $row['filename'] = $row['photo'];
                $row['url'] = $row['photo'];
                $row['cls'] = 'pointer';
            } elseif (filter_var($row['photo'], FILTER_VALIDATE_URL)) {
                $row['filename'] = '/modules/Admin/img/urlcontainer.png';
                $row['url'] = $row['photo'];
                $row['photo'] = "";
            }
        }
    }

    protected function _postDelRow()
    {
        $this->clearCache();
    }

    public function addPics()
    {
        $response = ["success" => true];
        $folder = $this->getReqVar("folder", "text");
        $album = $this->getReqVar("c_id", "int");
        $names = $this->getReqVar("names", "json");
        $sql = "INSERT INTO cms_pictures SET album_id=?, photo=?, sortorder=?";
        try {
            foreach ($names as $name) {
                $this->db->Execute($sql, [$album, UPLOADPATH . $folder . '/' . $name, -1]);
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
        $this->clearCache();
        return $response;
    }

    public function reorder()
    {
        $response = ["success" => true];
        $id = $this->getReqVar("order", "json");
        $result = true;
        $info = 'success_update';
        $ids = $this->getReqVar("order", "json");
        $sql = "UPDATE cms_pictures SET sortorder=? WHERE id=?";
        try {
            foreach ($ids as $key => $val) {
                $data = [$key, $val];
                $this->db->Execute($sql, $data);
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
        $this->clearCache();
        return [
            "success" => $result,
            'message' => $info
        ];
    }

    public function getYouTubeData()
    {
        $response = ['success' => false];
        $loader = new YoutubeDataLoader($this->getReqVar("code", "text"), $this->getReqVar("item", "int"));

        if (!$loader->isSuccess()) {
            return $response;
        }
        return [
            'success' => true,
            'title' => $loader->title,
            'html' => $loader->getHtml()
        ];
    }
}
