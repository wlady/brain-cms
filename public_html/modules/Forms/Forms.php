<?php

namespace Bump\Modules\Forms;

use Bump\Core\CMS;

// @codeCoverageIgnoreStart
include_once __DIR__ . "/lib/simple_html_dom.php";
// @codeCoverageIgnoreEnd

class Forms extends \Bump\Core\Module
{
    protected static $settings = [];

    public function init()
    {
        $this->view_model = new Model\View();
        $this->model = new Model\Form();
    }

    protected function _preSaveRow(&$fields)
    {
        $tpl = CMS::Config()->template;
        $doc = $tpl->toString("string:{$fields['content']}");
        $dom = str_get_html('<pre>' . $doc . '</pre>');
        $inputs = 0;
        if ($found = $dom->find('textarea')) {
            $inputs += count($found);
        }
        if ($found = $dom->find('select')) {
            $inputs += count($found);
        }
        if ($found = $dom->find('input')) {
            $inputs = count($found);
        }
        $fields['fields'] = $inputs;
    }

    protected function _preDelRow(&$ids)
    {
        $sql = "DELETE FROM cms_form_fields WHERE fform IN (" . implode(',', $ids) . ")";
        $this->db->Execute($sql);
    }

    /**
     * @JSDataStore(id:=forms empty:=1)
     * @JSDataStore(id:=forms2)
     */
    public function getFormsArray()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [['', CMS::Labels()->not_selected]];
        } else {
            $res = [];
        }
        $sql = "SELECT id, name FROM cms_forms WHERE active='true' ORDER BY name";
        if ($rows = $this->db->CacheGetAll(MAX_CACHE_TIME, $sql)) {
            foreach ($rows as $row) {
                $res[] = [$row['id'], $row['name']];
            }
        }
        return $res;
    }

    public function showForm()
    {
        $args = func_get_arg(0);
        $data = $this->getReqVar('fields', 'array', $args);
        if (!is_array($_POST)) {
            $_POST = [];
        }
        $_POST = array_merge($_POST, $data);
        $form = $this->getReqVar('name', 'text', $args);
        $sql = "SELECT * FROM cms_forms WHERE name=? AND active='true'";
        if (($row = $this->db->GetRow($sql, $form))) {
            $values = [];
            $fields = [];
            $formFields = new \Bump\Modules\FormFields\FormFields();
            $result = $formFields->getFields([
                'limit' => -1,
                'fform' => $row['id']
            ]);
            if (isset($result['rows'])) {
                $fields = $result['rows'];
            } else {
                if (is_array($result)) {
                    $fields = $result;
                }
            }
            // assign defaults
            foreach ($fields as $field) {
                $values[$field['fname']] = $field['fdefault'];
                if (isset($_POST[$field['fname']])) {
                    $values[$field['fname']] = $_POST[$field['fname']];
                }
            }
            // get values from params
            foreach ($_POST as $name => $value) {
                $values[$name] = $value;
            }
            $tpl = CMS::Config()->template;
            $tpl->setTpl('request', $values);
            return $tpl->toString("string:{$row['content']}");
        } else {
            return "Form was not found";
        }
    }

    public function parseInput()
    {
        $args = func_get_arg(0);
        $form = $this->getReqVar('name', 'text', $args);
        $error = true;
        $info = "Form was not found";
        $results = [];
        $sql = "SELECT * FROM cms_forms WHERE name=? AND active='true'";
        if (($row = $this->db->GetRow($sql, $form))) {
            $error = false;
            $formFields = new \Bump\Modules\FormFields\FormFields();
            $result = $formFields->getFields([
                'limit' => -1,
                'fform' => $row['id']
            ]);
            if ($result['rows']) {
                $fields = $result['rows'];
            } else {
                if (is_array($result)) {
                    $fields = $result;
                }
            }
            foreach ($fields as $field) {
                $val = $this->getReqVar($field['fname'], $field['ftype']);
                if (!$val && isset($field['fempty']) && $field['fempty'] == 'false') {
                    $info = "Field {$field['fname']} has wrong value";
                    $error = true;
                    break;
                }
                $results[$field['fname']] = $val;
            }
        }
        if (!$error) {
            return [
                'success' => true,
                'vars' => $results
            ];
        } else {
            return [
                'error' => true,
                'message' => $info
            ];
        }
    }

    public function parse()
    {
        $res = false;
        $parsed = 0;
        $id = $this->getReqVar('id', 'int');
        $sql = "SELECT content FROM cms_forms WHERE id=?";
        if ($content = $this->db->getOne($sql, $id)) {
            $content = CMS::Config()->template->toString("string:$content");
            if ($dom = str_get_html($content)) {
                $res = true;
                foreach ($dom->find('input') as $input) {
                    if (isset($input->type)) {
                        switch ($input->type) {
                            case 'text':
                            case 'hidden':
                            case 'password':
                            case 'checkbox':
                            case 'radio':
                            case 'email':
                            case 'tel':
                                $parsed++;
                                break;
                        }
                    }
                }
                foreach ($dom->find('textarea') as $input) {
                    $parsed++;
                }
                foreach ($dom->find('select') as $input) {
                    $parsed++;
                }
            }
        }
        if ($res) {
            return [
                'results' => $parsed,
                'success' => true
            ];
        } else {
            return [
                'success' => false
            ];
        }
    }

    public function saveParsed()
    {
        $res = false;
        $id = $this->getReqVar('id', 'int');
        $sql = "DELETE FROM cms_form_fields WHERE fform=?";
        $this->db->Execute($sql, $id);
        $sql = "SELECT content FROM cms_forms WHERE id=?";
        if ($content = $this->db->getOne($sql, $id)) {
            $content = CMS::Config()->template->toString("string:$content");
            if ($dom = str_get_html($content)) {
                $res = true;
                $parsed = 0;
                $formFields = new \Bump\Modules\FormFields\FormFields();
                $types = $formFields->getTypes();
                foreach ($dom->find('input') as $input) {
                    if (isset($input->type)) {
                        switch ($input->type) {
                            case 'text':
                            case 'hidden':
                            case 'password':
                                $parsed++;
                                $xtype = 'text';
                                if (isset($input->xtype) && isset($types[$input->xtype])) {
                                    $xtype = $input->xtype;
                                }
                                $fields = [
                                    'fform' => $id,
                                    'fname' => $input->name,
                                    'ftype' => $xtype,
                                    'fempty' => 'true',
                                    'fdefault' => ''
                                ];
                                $this->db->Replace('cms_form_fields', $fields, 'fid', true);
                                break;
                            case 'checkbox':
                            case 'radio':
                                $parsed++;
                                $fields = [
                                    'fform' => $id,
                                    'fname' => $input->name,
                                    'ftype' => 'checkbox',
                                    'fempty' => 'true',
                                    'fdefault' => ''
                                ];
                                $this->db->Replace('cms_form_fields', $fields, 'fid', true);
                                break;
                        }
                    }
                }
                foreach ($dom->find('textarea') as $input) {
                    $parsed++;
                    $fields = [
                        'fform' => $id,
                        'fname' => $input->id,
                        'ftype' => 'text',
                        'fempty' => 'true',
                        'fdefault' => ''
                    ];
                    $this->db->Replace('cms_form_fields', $fields, 'fid', true);
                }
                foreach ($dom->find('select') as $input) {
                    $parsed++;
                    $fields = [
                        'fform' => $id,
                        'fname' => $input->id,
                        'ftype' => 'text',
                        'fempty' => 'true',
                        'fdefault' => ''
                    ];
                    $this->db->Replace('cms_form_fields', $fields, 'fid', true);
                }
                $sql = "UPDATE cms_forms SET `fields`=? WHERE id=?";
                $this->db->Execute($sql, [$parsed, $id]);
            }
        }
        return [
            'success' => $res
        ];
    }
}
