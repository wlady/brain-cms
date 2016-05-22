<?php

namespace Bump\Modules\Library;

use Bump\Core\CMS;

class Library extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\LibraryArticle();
    }

    protected function _preSaveRow(&$fields)
    {
        if ($fields['title'] && empty($fields['alias'])) {
            $fields['alias'] = \Bump\Tools\Utils::makeSlug($fields['title']);
        }
    }

    /**
     * @JSDataStore(id:=libraryDocs empty:=1)
     */
    public function getLibraryDocsArray()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [['', CMS::Labels()->not_selected]];
        } else {
            $res = [];
        }
        $sql = "SELECT id,title FROM cms_library_articles WHERE active='true' ORDER BY title";
        if ($rows = $this->db->GetAll($sql)) {
            foreach ($rows as $row) {
                $res[] = [$row['id'], $row['title']];
            }
        }
        return $res;
    }

    public function reload()
    {
        return [
            'success' => true,
            'ds' => $this->getLibraryDocsArray()
        ];
    }

    public function getByAlias()
    {
        $args = func_get_arg(0);
        $results = "";
        if ($alias = $this->getReqVar('alias', 'text', $args)) {
            if ($res = $this->getRow([
                'alias' => $alias,
                'active' => 'true'
            ])
            ) {
                $tpl = CMS::Config()->template;
                $res['content'] = $tpl->toString("string:{$res['content']}");
                $results = $res;
            }
        }
        return $results;
    }

    public function getById()
    {
        $args = func_get_arg(0);
        $results = "";
        if ($id = $this->getReqVar('id', 'int', $args)) {
            if ($res = $this->getRow([
                'id' => $id,
                'active' => 'true'
            ])
            ) {
                $tpl = CMS::Config()->template;
                $res['content'] = $tpl->toString("string:{$res['content']}");
                $results = $res;
            }
        }
        return $results;
    }

}
