<?php

namespace Bump\Modules\SeoMetaDatasFields\Model;

class SeoMetaDatasField extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_seometadatas_fields', $pkeysarr, $db, $options);
    }
}
