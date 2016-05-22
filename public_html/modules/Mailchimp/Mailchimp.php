<?php

namespace Bump\Modules\Mailchimp;

use Bump\Core\CMS;
use Bump\Core\ExtStoreFilter;

class Mailchimp extends \Bump\Core\Module
{

    protected static $settings = null;
    protected static $mc = null;

    public function init()
    {
        $this->model = new Model\MailchimpMember();
        if (!is_array(self::$settings)) {
            if ($data = self::getModuleSettings(get_class())) {
                self::$settings = $data;
            }
        }
        if (!self::$mc) {
            self::$mc = new \Mailchimp(self::$settings['api_key']);
        }
    }

    public function getSettings()
    {
        return self::$settings;
    }


    public function getList($filters=[], $start=0, $limit=25)
    {
        return self::$mc->lists->getList($filters, $start, $limit);
    }

    public function getMembers($list=false, $status='subscribed', $opts=[])
    {
        if (!$list) {
            $list = self::$settings['active_list_id'];
        }
        return self::$mc->lists->members($list, $status, $opts);
    }

    public function getRows()
    {
        if ($this->getReqVar('_t', 'text') == 'list') {
            $start = (int)$this->getReqVar('page')? (int)$this->getReqVar('page') - 1: 0;
            $limit = (int)$this->getReqVar('limit')? (int)$this->getReqVar('limit'): 20;
            $list = $this->getList();
            return [
                'metaData' => [
                    'totalProperty' => 'results',
                    'root' => 'rows',
                    'id' => 'id',
                    'fields' => [
                        ['name' => 'id'],
                        ['name' => 'name'],
                        ['name' => 'date_created', 'dateFormat' => 'Y-m-d H:i:s'],
                    ],
                ],
                'results' => $list['total'],
                'rows' => $list['data'],
            ];
        }
        return parent::getRows();
    }

    // @codeCoverageIgnoreStart
    public function subscribe($email, $list=false, $merge_vars=null)
    {
        if (!$list) {
            $list = self::$settings['active_list_id'];
        }
        if (!is_array($email)) {
            $email = ['email' => $email];
        }
        try {
            return self::$mc->lists->subscribe($list, $email, $merge_vars);
        } catch (\Mailchimp_Error $e) {
            if ($e->getMessage()) {
                return $e->getMessage();
            } else {
                return 'Something went wrong. Please contact to administrator.';
            }
        }
    }

    public function unsubscribe($email, $list=false, $delete_member=false)
    {
        if (!$list) {
            $list = self::$settings['active_list_id'];
        }
        if (!is_array($email)) {
            $email = ['email' => $email];
        }
        try {
            return self::$mc->lists->unsubscribe($list, $email, $delete_member);
        } catch (\Mailchimp_Error $e) {
            if ($e->getMessage()) {
                return $e->getMessage();
            } else {
                return 'Something went wrong. Please contact to administrator.';
            }
        }
    }

    public function _preGetRows(&$filters)
    {
        $filters[] = new ExtStoreFilter('list', '=', $this->getReqVar('list', 'string'), 'string');
    }

    public function saveRow()
    {
        $merge_vars = [
            'MERGE1' => $this->getReqVar('MERGE1'),
            'MERGE2' => $this->getReqVar('MERGE2')
        ];

        $result = (new Mailchimp)->subscribe(array(
            'email' => CMS::Request()->getReqVar('email')
        ), CMS::Request()->getReqVar('list'), $merge_vars);

        if (is_array($result)) {
            return [
                'success' => true,
                'message' => 'Confirmation Email was sent. Please sync current list later'
            ];
        } else {
            return [
                'success' => false,
                'message' => $result
            ];
        }
    }

    public function delRow()
    {
        $ids = $this->getReqVar('id', 'json_array');
        try {

            foreach ($ids as $id) {
                $row = $this->getRow(['id' => $id]);
                if ($this->isAjax()) {
                    if (is_array($row) && isset($row['data'])) {
                        $row = $row['data'];
                    } else {
                        $row = false;
                    }
                }
                if ($row) {
                    if (in_array($row['status'], array('cleaned', 'unsubscribed'))) {
                        $delete_member = true;
                    } else {
                        $delete_member = false;
                    }
                    if (is_array($this->unsubscribe($row['email'], $row['list'], $delete_member))) {
                        if (!$delete_member) {
                            $row['status'] = 'unsubscribed';
                            $this->db->Replace('cms_mailchimp_members', $row, 'id', true);
                        } else {
                            $this->db->Execute('DELETE FROM `cms_mailchimp_members` WHERE `id`=?', $id);
                        }
                    }
                }
            }
            return [
                'success' => true
            ];

        } catch (\Mailchimp_Error $e) {

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];

        }
    }

    public function export($listId=null, $groups=null, $status='subscribed')
    {
        if (!$listId) {
            $listId = self::$settings['active_list_id'];
        }
        $apikey = self::$settings['api_key'];
        $chunk_size = 4096; //in bytes
        $results = [];
        $params = array(
            'id' => $listId,
            'apikey' => $apikey,
            'status' => $status
        );
        if ($groups) {
            $conditions = array();
            $conditions[] = array('field' => $groups['interests'], 'op' => $groups['op'], 'value' => $groups['value']);
            $opts = array('match' => 'all', 'conditions' => $conditions);
            $params['groups'] = $opts;
        }
        if (preg_match('/us[\d]{1,5}/iu', $apikey, $matches)) {
            $url = 'http://'.$matches[0].'.api.mailchimp.com/export/1.0/list?'.http_build_query($params);
            $handle = @fopen($url, 'r');
            if (!$handle) {
                echo "failed to access url\n";
            } else {
                $i = 0;
                $header = array();
                while (!feof($handle)) {
                    $buffer = fgets($handle, $chunk_size);
                    if (trim($buffer) != '') {
                        $obj = json_decode($buffer);
                        if ($i == 0) {
                            $header = $obj;
                        } else {
                            $tmpRes = [];
                            foreach ($header as $key => $val) {
                                $tmpRes[$val] = $obj[$key];
                            }
                            $results[] = $tmpRes;
                        }
                        $i++;
                    }
                }
                fclose($handle);
            }
        }
        return $results;
    }

    public function sync()
    {
        $lists = $this->getReqVar('id', 'json_array');

        if (!$lists) {
            $data = (new Mailchimp())->getList();
            if (isset($data['data'])) {
                foreach ($data['data'] as $val) {
                    $lists[] = $val['id'];
                }
            }
        }

        $updated = date('Y-m-d H:i:s');

        foreach (['subscribed', 'unsubscribed', 'cleaned'] as $status) {
            foreach ($lists as $list) {
                foreach ((new Mailchimp())->export($list, null, $status) as $member) {

                    $row = $this->getRow(['member' => $member['EUID']]);

                    if ($this->isAjax()) {
                        if (is_array($row) && isset($row['data'])) {
                            $row = $row['data'];
                        } else {
                            $row = false;
                        }
                    }

                    if (!$row) {
                        $row = [
                            'member' => $member['EUID'],
                            'created' => $member['CONFIRM_TIME']
                        ];
                    }

                    $row['email'] = $member['Email Address'];
                    $row['firstname'] = $member['First Name'];
                    $row['lastname'] = $member['Last Name'];
                    $row['status'] = $status;
                    $row['list'] = $list;
                    $row['updated'] = $updated;

                    try {
                        $this->db->Replace('cms_mailchimp_members', $row, 'id', true);
                    } catch (\Exception $e) {
                        return [
                            'success' => false,
                            'message' => $e->getMessage()
                        ];
                    }
                }
            }
        }
        if (count($lists)) {
            $this->db->Execute('DELETE FROM `cms_mailchimp_members` WHERE `list` IN ("' . implode('","', $lists) . '") AND `updated`<>?', $updated);
        }
        return [
            'success' => true,
            'message' => 'Lists were updated'
        ];
    }
    // @codeCoverageIgnoreEnd

}
