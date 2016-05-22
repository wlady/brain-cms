<?php

namespace Bump\Modules\UsersGroups;

use Bump\Core\CMS;

class UsersGroups extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\UsersGroup();
    }

    /**
     * @codeCoverageIgnore
     */
    protected function _postSaveRow($fields, $odds)
    {
        $this->clearCache();
    }

    /**
     * @codeCoverageIgnore
     */
    protected function _postDelRow()
    {
        $this->clearCache();
    }

    /**
     * @JSDataStore(id:=usersGroups empty:=1)
     * @JSDataStore(id:=usersGroups2)
     */
    public function getUsersGroupsArray()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [['', CMS::Labels()->not_selected]];
        } else {
            $res = [];
        }
        $sql = "SELECT group_id,user_group FROM cms_users_groups WHERE group_active='true' AND user_level<=? ORDER BY user_level DESC";
        if ($rows = $this->db->CacheGetAll(MAX_CACHE_TIME, $sql,
            CMS::User()->getUserLevel())
        ) {
            foreach ($rows as $row) {
                $res[] = [$row['group_id'], $row['user_group']];
            }
        }
        return $res;
    }

    public function getAllUsersGroupsAssoc()
    {
        $res = [];
        $sql = "SELECT user_level,user_group FROM cms_users_groups ORDER BY user_level DESC";
        if ($rows = $this->db->CacheGetAssoc(MAX_CACHE_TIME, $sql)) {
            $res = $rows;
        }
        return $res;
    }

    public function getAllowedUsersGroupsArray()
    {
        $res = [];
        $sql = "SELECT user_level,user_group,group_active FROM cms_users_groups WHERE user_level<=? ORDER BY user_level DESC";
        if ($rows = $this->db->CacheGetAll(MAX_CACHE_TIME, $sql,
            CMS::User()->getUserLevel())
        ) {
            foreach ($rows as $row) {
                if ($row['user_level']) {
                    $res[] = [
                        'level' => $row['user_level'],
                        'text' => $row['user_group'],
                        'disabled' => $row['group_active'] == 'true' ? false : true
                    ];
                } else {
                    $res[] = [
                        'level' => $row['user_level'],
                        'text' => CMS::Labels()->everyone,
                        'disabled' => false
                    ];
                }
            }
        }
        return $res;
    }
}
