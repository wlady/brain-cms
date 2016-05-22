<?php

namespace Bump\Modules\Settings;

class Settings extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\Config();
    }

    public function getRows()
    {
        $args = func_get_arg(0);
        $args['levels'] = (string)\Bump\Core\CMS::User()->getUserLevel(); // field type 'set' !!!
        $args['editable'] = 'true';
        $args['limit'] = -1;
        return parent::getRows($args);
    }

    protected function _postSaveRow()
    {
        $this->clearCache();
    }
}
