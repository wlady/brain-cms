<?php

namespace Bump\Modules\Albums\Model;

class Album extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_albums', $pkeysarr, $db, $options);
    }
}
