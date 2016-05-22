<?php

namespace Bump\Modules\UrlMaps;

class UrlMaps extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\UrlMap();
    }

    protected function _preSaveRow(&$fields)
    {
        $fields['old_url'] = $this->normalize($fields['old_url']);
        $fields['new_url'] = $this->normalize($fields['new_url']);
        $sql = "SELECT * FROM cms_urlmaps WHERE id<>? AND old_url=?";
        if ($url = $this->db->getRow($sql, [$fields['id'], $fields['old_url']])) {
            throw new \Exception('Old URL <b style="color:red">' . $fields['old_url'] . '</b> is already mapped to <b style="color:red">' . $url['new_url'] . '</b>');
        }
    }

    protected function _postSaveRow(&$fields)
    {
        $this->clearCache();
    }

    private function normalize($url)
    {
        $tmp = parse_url($url);
        $res = $tmp['path'];
        if (isset($tmp['query'])) {
            $res .= '?'.$tmp['query'];
        }
        if (isset($tmp['fragment'])) {
            $res .= '#'.$tmp['fragment'];
        }
        return $res;
    }
}
