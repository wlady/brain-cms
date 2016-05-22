<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class Module extends \Bump\AdoDB\Recordset
{

    public function __construct()
    {
        parent::__construct();
        $this->init();
    }

    protected function init()
    {
    }

    public function getModuleSettings($module)
    {
        $reflection = new \ReflectionClass($module);
        $values = [];
        if ($res = $this->db->CacheGetOne(MAX_CACHE_TIME, 'SELECT m_settings FROM cms_modules WHERE m_path=?',
            $reflection->getShortName())
        ) {
            $config = unserialize($res);
            if (isset($config['Settings']) && is_array($config['Settings'])) {
                foreach ($config['Settings'] as $set) {
                    if (isset($set['name'])) {
                        if (preg_match('~settings\[(.*?)\]~i', $set['name'], $mm)) {
                            $name = $mm[1];
                            $values[$name] = '';
                            if (array_key_exists('value', $set)) {
                                if ($set['value'] == 'true' || $set['value'] == 'on') {
                                    $values[$name] = true;
                                } elseif ($set['value'] == 'false' || $set['value'] == 'off') {
                                    $values[$name] = false;
                                } else {
                                    $values[$name] = $set['value'];
                                }
                            }
                        }
                    }
                }
            }
        }
        return $values;
    }

    public function checkAccess($module = '', $method = '')
    {
        if ($module) {
            $userLevel = CMS::User()->getUserLevel();
            try {
                $reflection = new \ReflectionClass($module);
                if ($rcm = $reflection->getMethod($method)) {
                    $ans = $rcm->getDocComment();
                    $found = false;
                    if (preg_match('/@AccessLevel\((.*)\)/is', $ans, $matches)) {
                        array_walk(explode(',', $matches[1]), function ($item) use ($userLevel, &$found) {
                            $level = trim($item);
                            if ($userLevel >= $level) {
                                $found = true;
                            }
                        });
                    }
                    if ($found) {
                        return true;
                    }
                }
            } catch (\Exception $e) {
                // will return FALSE in next block
            }
            $sql = 'SELECT m_path FROM cms_modules WHERE FIND_IN_SET(?, m_levels) AND m_path=? AND m_active="true"';
            $res = $this->db->CacheGetOne(MAX_CACHE_TIME, $sql, [$userLevel, $reflection->getShortName()]);
            if ($res) {
                CMS::session()->setItem('last_activity', time());
                return true;
            }
        }
        return false;
    }
}
