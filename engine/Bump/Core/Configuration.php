<?php
/**
 * This file is part of Bump 6.0 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class Configuration extends \Bump\AdoDB\AdoDB
{
    protected $db = null;

    public function init()
    {
        $this->db = parent::init();
        $rows = $this->db->CacheGetAll(MAX_CACHE_TIME, "SELECT * FROM cms_configs");
        if ($rows) {
            foreach ($rows as $row) {
                $var = $row['name'];
                switch ($row['type']) {
                    case 'boolean':
                        $this->$var = $row['value'] == 'true';
                        break;
                    default:
                        $this->$var = $row['value'];
                        break;
                }
            }
        }
    }

    public function __get($var)
    {
        if (property_exists($this, $var)) {
            return $this->$var;
        }
        return '';
    }

}
