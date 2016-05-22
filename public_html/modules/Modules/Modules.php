<?php

namespace Bump\Modules\Modules;

use Bump\Core\CMS;
use Bump\Core\ExtStoreFilter;

class Modules extends \Bump\Core\Module
{
    protected $modules = [];

    public function init()
    {
        $this->model = new Model\Module();
        $this->collectModules();
    }

    private function collectModules()
    {
        foreach (new \DirectoryIterator(MODULESDIR) as $_res) {
            if ($_res->isDot()) {
                unset($_res);
                continue;
            }
            if ($_res->isDir()) {
                $name = $_res->getFilename();
                $base = $_res->getPathname();
                $config['Path'] = $config['Title'] = $name;
                $config['Version'] = '';
                $fn = file_exists($base . '/config.json') ? $base . '/config.json' : '';
                if ($fn) {
                    $config = json_decode(file_get_contents($fn), true);
                    $config['Path'] = $name;
                    $config['Active'] = 'false';
                    $config['Disabled'] = true;
                }
                $config['iconPath'] = 'modules';
                $this->modules[$name] = $config;
            }
        }
    }

    public function getModules()
    {
        return $this->modules;
    }

    public function getRows()
    {
        return parent::getRows([
            'sort'  => 'm_panel,m_order',
            'limit' => -1
        ]);
    }

    protected function _preGetRows(&$filters)
    {
        $groupCl = new \Bump\Modules\UsersGroups\UsersGroups();
        $groups = $groupCl->getAllUsersGroupsAssoc();
        $level = CMS::User()->getUserLevel();
        $ind = array_search($level, array_keys($groups));
        if ($ind !== false) {
            $groups = array_slice($groups, $ind, count($groups), true);
        }
        if (empty($filters)) {
            $filters = [];
        }
        $filters[] = new ExtStoreFilter('m_levels', '=', array_keys($groups), 'set');
    }

    protected function _postGetRows(&$rows)
    {
        foreach ($rows as &$row) {
            $this->parseSettings($row);
        }
    }

    protected function _postGetRow(&$row)
    {
        $this->parseSettings($row);
    }

    protected function parseSettings(&$row)
    {
        $row['Status'] = 'orphan';
        if (array_key_exists($row['m_path'], $this->modules)) {
            $set = unserialize($row['m_settings']);
            $row['Settings'] = isset($set['Settings']) ? json_encode($set['Settings']) : "";
            if (file_exists(MODULESDIR . $row['m_path'] . '/ux/tpl/style.css')) {
                $row['iconPath'] = $row['m_path'];
            } else {
                $row['iconPath'] = 'Modules';
                if (isset($set['Depends'])) {
                    $row['iconPath'] = $set['Depends'];
                }
            }
            if (isset($set['Panel'])) {
                $row['Group'] = ucwords($set['Panel']);
            } else {
                $row['Group'] = 'Hidden';
            }
            if (isset($set['Version'])) {
                $row['Version'] = $set['Version'];
            }
            if (isset($set['Author'])) {
                $row['Author'] = $set['Author'];
            }
            if (isset($set['Publisher'])) {
                $row['Publisher'] = $set['Publisher'];
            }
            $row['Status'] = 'active';
            if (isset($set['Core']) && $set['Core']) {
                $row['Status'] = 'system';
            } elseif (isset($set['Depends'])) {
                $row['Group'] = 'Hidden';
                if (array_key_exists($set['Depends'], $this->modules)) {
                    $ascendant = $this->modules[$set['Depends']];
                    $row['Status'] = 'depend';
                    $row['Depends'] = $ascendant['Title'];
                }
            }
        }
    }

    public function saveSettings()
    {
        $active = $this->getReqVar("m_active", "text");
        if (!$active) {
            $active = 'true';
        }
        $path = $this->getReqVar("m_path", "text");
        $settings = $this->getReqVar("settings", "array");
        $result = true;
        $data = [
            'm_active'   => $active,
            'm_settings' => '',
            'm_path'     => ''
        ];
        $info = "";
        $sql = "SELECT * FROM cms_modules WHERE m_path=?";
        $row = $this->db->GetRow($sql, $path);
        if ($row) {
            $config = unserialize($row['m_settings']);
            if (isset($config['Core']) && $config['Core']) {
                // core modules are active forever
                $data['m_active'] = 'true';
            }
            if (isset($config['Settings']) && is_array($config['Settings']) && count($settings)) {
                foreach ($config['Settings'] as $key => $set) {
                    if (preg_match('~settings\[(.*?)\]~i', $set['name'], $mm)) {
                        $name = $mm[1];
                        if (array_key_exists($name, $settings)) {
                            switch ($settings[$name]) {
                                case 'true':
                                case 'on':
                                    $config['Settings'][$key]['value'] = 'true';
                                    break;
                                case 'false':
                                case 'off':
                                    $config['Settings'][$key]['value'] = 'false';
                                    break;
                                default:
                                    $config['Settings'][$key]['value'] = $settings[$name];
                            }
                        }
                    }
                }
                $data['m_settings'] = serialize($config);
            }
            $data['m_path'] = $path;
            $sql = "UPDATE cms_modules SET m_active=? , m_settings=? WHERE m_path=?";
            if (empty($data['m_settings'])) {
                unset($data['m_settings']);
                $sql = "UPDATE cms_modules SET m_active=? WHERE m_path=?";
            }
            try {
                $this->db->Execute($sql, $data);
            } catch (\Exception $e) {
                throw new \Exception($e->getMessage());
            }
        }
        $this->clearCache();
        $response = [
            'data'    => [],
            'success' => $result,
            'message' => $info
        ];

        return $response;
    }

    private function collectUserModules($rows)
    {
        $modules = [];
        foreach ($rows as $row) {
            $st = unserialize($row['m_settings']);
            $row['iconPath'] = $row['m_path'];
            if (!file_exists(MODULESDIR . $row['m_path'] . '/ux/tpl/style.css')) {
                $row['iconPath'] = 'Modules';
                if (isset($st['Depends'])) {
                    $row['iconPath'] = $st['Depends'];
                }
            }
            if (!empty($st['Depends'])) {
                $dep = $this->getModule($st['Depends']);
                if ($dep['m_active'] == 'false') {
                    continue;
                }
            }
            if ($st && isset($st['Panel'])) {
                $var = $st['Panel'];
                if (!isset($modules[$var])) {
                    $modules[$var] = [];
                }
                array_push($modules[$var], $row);
            } else {
                $var = 'hidden';
                if (!isset($modules[$var])) {
                    $modules[$var] = [];
                }
                array_push($modules[$var], $row);
            }
        }

        return $modules;
    }

    public function getUserModules()
    {
        $modules = [];
        $rows = $this->getModulesByUserId(CMS::User()->getID());
        if ($rows) {
            $allRows = [];
            foreach ($rows as $key => $data) {
                $allRows = array_merge($allRows, $data);
            }
            $modules = $this->collectUserModules($allRows);
            $modules['hidden'] = $this->getSelectableUserModules(true);
        }

        return $modules;
    }

    public function getSelectableUserModules($hidden = false)
    {
        $modules = [];
        $id = CMS::User()->getID();
        $all = $this->getAllActiveByUserId($id);
        if (!$hidden) {
            unset($all['hidden']);
        } else {
            return $all['hidden'];
        }
        foreach ($all as $data) {
            $modules = array_merge($modules, $data);
        }

        return $modules;
    }

    private function getModulesByUserId($id)
    {
        $modules = [];
        if ($rows = $this->db->GetAll("SELECT * FROM cms_modules m LEFT JOIN cms_users_modules um ON m.m_id=um.module_id WHERE um.id=? AND m.m_active='true' ORDER BY m.m_panel, m.m_order",
            $id)
        ) {
            $modules = $this->collectUserModules($rows);
        }

        return $modules;
    }

    private function getAllByUserId($id)
    {
        $modules = [];
        $users = new \Bump\Modules\Users\Users();
        $user = $users->getRow(['user_id' => intval($id)]);
        if ($user) {
            if (isset($user['rows'])) {
                $user = $user['rows'][0];
            } else {
                if (isset($user['data'])) {
                    $user = $user['data'];
                }
            }
            if ($rows = $this->db->GetAll("SELECT * FROM cms_modules WHERE FIND_IN_SET(?, m_levels) ORDER BY m_panel, m_order",
                $user['user_level'])
            ) {
                $modules = $this->collectUserModules($rows);
            }
        }

        return $modules;
    }

    private function getAllActiveByUserId($id)
    {
        $modules = [];
        $users = new \Bump\Modules\Users\Users();
        $user = $users->getRow(['user_id' => intval($id)]);
        if ($user) {
            if (isset($user['rows'])) {
                $user = $user['rows'][0];
            } else {
                if (isset($user['data'])) {
                    $user = $user['data'];
                }
            }
            $level = $user['user_level'];
            $sql = 'SELECT * FROM cms_modules WHERE m_active="true" ORDER BY m_panel, m_order';
            if ($rows = $this->db->GetAll($sql)) {
                $res = [];
                foreach ($rows as $row) {
                    $found = false;
                    array_walk(explode(',', $row['m_levels']), function ($item) use (&$found, $level) {
                        if ($item <= $level) {
                            $found = true;
                        }
                    });
                    if ($found) {
                        $res[] = $row;
                    }
                }
                $modules = $this->collectUserModules($res);
            }
        }

        return $modules;
    }

    public function getAssigned()
    {
        $columns = $this->getReqVar("columns", "int");
        if (!$columns) {
            $columns = 3;
        }
        $id = $this->getReqVar("id", "int");
        $nodes = [];
        $modules = $this->getAllByUserId($id);
        if ($modules) {
            $contSysModules = [];
            foreach ($modules as $group => $module) {
                if ($group != 'hidden') {
                    $contSysModules = array_merge($contSysModules,
                        $modules[$group]);
                }
            }
            $allModules = [];
            foreach ($contSysModules as &$module) {
                $module['selected'] = 'false';
                $allModules[$module['m_id']] = $module;
            }
            $sql = "SELECT SQL_CALC_FOUND_ROWS m_id FROM cms_users_modules um INNER JOIN cms_modules m ON m.m_id=um.module_id WHERE um.id=? ORDER BY m.m_panel, m.m_order";
            if ($rows = $this->db->getAll($sql, $id)) {
                foreach ($rows as $row) {
                    if (array_key_exists($row['m_id'], $allModules)) {
                        $allModules[$row['m_id']]['selected'] = 'true';
                    } else {
                        $allModules[$row['m_id']]['selected'] = 'false';
                    }
                }
            }
            foreach ($allModules as $moduleId => $data) {
                if (isset($data['m_id'])) {
                    $nodes[] = [
                        'id'       => $moduleId,
                        'name'     => $data['m_name'],
                        'path'     => $data['m_path'],
                        'iconPath' => $data['iconPath'],
                        'checked'  => ($data['selected'] == 'true' ? "checked='checked'"
                            : '')
                    ];
                }
            }
        }
        $response = [
            'metaData' => [
                'totalProperty' => 'results',
                'root'          => 'rows',
                'id'            => 'id',
                'fields'        => [
                    ['name' => 'id'],
                    ['name' => 'name'],
                    ['name' => 'path'],
                    ['name' => 'iconPath'],
                    ['name' => 'checked']
                ]
            ],
            'results'  => count($nodes),
            'rows'     => $nodes,
            'success'  => true
        ];

        return $response;
    }

    public function getActiveModules()
    {
        $modules = [];
        if ($rows = $this->db->GetAll("SELECT * FROM cms_modules WHERE m_active='true'")) {
            $modules = $rows;
        }

        return $modules;
    }

    public function getUserModulesLang()
    {
        $modules = [];
        $userLevel = CMS::User()->getUserLevel();
        if ($userLevel && ($rows = $this->db->GetAll("SELECT * FROM cms_modules WHERE FIND_IN_SET(?, m_levels) AND m_active='true'ORDER BY m_order",
                $userLevel))
        ) {
            $modules = $rows;
        }

        return $modules;
    }

    public function getModule($path)
    {
        $sql = "SELECT * FROM cms_modules WHERE m_path=?";

        return $this->db->GetRow($sql, $path);
    }

    public function reorder()
    {
        $ids = $this->getReqVar("order", "json");
        $panel = $this->getReqVar("panel", "text");
        $result = true;
        $info = 'success_update';
        $sql = "UPDATE cms_modules SET m_order=? WHERE m_id=? AND m_panel=?";
        try {
            foreach ($ids as $key => $val) {
                $data = [$key, $val, $panel];
                $this->db->Execute($sql, $data);
            }
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }

        return [
            "success" => $result,
            'message' => $info
        ];
    }

    public function getModulesArray()
    {
        return [
            'fields' => json_encode($this->getModelFields($this->model)),
            'data'   => json_encode($this->getRows())
        ];
    }

    public function getUserModulesArray()
    {
        return [
            'fields' => json_encode($this->getModelFields($this->model)),
            'data'   => json_encode($this->getSelectableUserModules())
        ];
    }

    public function purgeCache()
    {
        passthru('rm -rf ' . TMPDIR . '/.xcache/*');
        passthru('rm -rf ' . TMPDIR . '/.minify/*');
        // rebuild routes
        \Bump\Tools\Utils::buildRoutes();
        $this->clearCache();

        return ['success' => true];
    }

}
