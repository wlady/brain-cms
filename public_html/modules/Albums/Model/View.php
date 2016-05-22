<?php

namespace Bump\Modules\Albums\Model;

class View extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_view_albums', 'c_id', $db, $options);
    }
}
