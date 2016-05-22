<?php

namespace Bump\Modules\SeoMetaDatas\Model;

class SeoMetaData extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_seometadatas', $pkeysarr, $db, $options);
    }
}
