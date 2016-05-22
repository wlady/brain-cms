<?php

namespace Bump\Modules\UrlMaps\Tests\Fixtures;

class UrlMapsFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            ['phpunittest', 'www.phpunittestnew1.com']
        ];
        $sql = 'INSERT INTO `cms_urlmaps` (`old_url`, `new_url`) VALUES (?,?)';
        foreach ($testData as $tdata){
            try{
                $this->db->Execute($sql, $tdata);
            } catch (\Exception $e) {
                print(\Exception($e->getMessage()));
            }
        }
    }

    public function remove()
    {
        $sql = 'DELETE FROM cms_urlmaps WHERE old_url=?';
        try {
            $this->db->Execute($sql, 'phpunittest');
        } catch (\Exception $e) {
            print( \Exception($e->getMessage()));
        }
    }
}
