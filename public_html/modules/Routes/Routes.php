<?php

namespace Bump\Modules\Routes;

class Routes extends \Bump\Core\Module
{
    protected static $settings = [];

    public function init()
    {
        $this->model = new Model\Route();
    }

    public function saveRows($rows)
    {
        $this->db->StartTrans();
        $sql = 'TRUNCATE TABLE cms_routes';
        $this->db->Execute($sql);
        $sql = 'INSERT INTO cms_routes SET url=?, route=?, method=?';
        foreach ($rows as $row) {
            $this->db->Execute($sql, [$row['url'], $row['route'], $row['method']]);
        }
        $this->db->CompleteTrans();
    }
}
