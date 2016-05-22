<?php

namespace Bump\Modules\EmailLogs\Tests\Fixtures;

class EmailLogsFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            ['<br>UnitTestsEmailLogs@exempel.com', '<br>UnitTestsAddressTo@exempel.com', 'PHP Unit Test EmailLog', 1, 1, '1990-01-01']
        ];
        $sql = 'INSERT INTO `cms_email_logs` (`fl_address_from`, `fl_address_to`, `fl_message`, `form_id`, `fl_post`, `fl_date`) VALUES (?,?,?,?,?,?)';
        foreach ($testData as $tdata){
            try{
                $this->db->Execute($sql, $tdata);
            } catch (\Exception $e) {
                print(new \Exception($e->getMessage()));
            }
        }
    }

    public function remove()
    {
        $sql = 'DELETE FROM cms_email_logs WHERE fl_message=?';
        try {
            $this->db->Execute($sql, 'PHP Unit Test EmailLog');
        } catch (\Exception $e) {
            print(new \Exception($e->getMessage()));
        }
    }
}
