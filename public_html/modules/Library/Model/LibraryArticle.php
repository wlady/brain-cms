<?php

namespace Bump\Modules\Library\Model;

class LibraryArticle extends \Bump\AdoDB\ActiveRecord
{

    public function __construct($table = false, $pkeysarr = false, $db = false, $options = array())
    {
        parent::__construct('cms_library_articles', $pkeysarr, $db, $options);
    }
}
