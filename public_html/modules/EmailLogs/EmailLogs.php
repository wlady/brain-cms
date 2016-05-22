<?php

namespace Bump\Modules\EmailLogs;

class EmailLogs extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\EmailLog();
    }

    protected function _postGetRows(&$rows)
    {
        foreach ($rows as &$row) {
            $row['fl_address_to'] = htmlspecialchars($row['fl_address_to']);
            $row['fl_address_from'] = htmlspecialchars($row['fl_address_from']);
        }
    }
}
