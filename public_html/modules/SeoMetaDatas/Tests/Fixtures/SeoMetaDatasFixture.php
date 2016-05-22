<?php

namespace Bump\Modules\SeoMetaDatas\Tests\Fixtures;

class SeoMetaDatasFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            ['/php-unit-test', 'O:8:"stdClass":4:{s:8:"f_xtitle";s:64:"Code Rebel | iRAPP | Mac Terminal Server | OS X Terminal Server";s:11:"f_xkeywords";s:76:"os x terminal server, os x terminal services, pc to mac, mac terminal server";s:11:"f_xprotocol";s:4:"http";s:10:"f_xsitemap";s:4:"true";}'],
        ];
        $sql = "INSERT INTO `cms_seometadatas` (`url`, `data`) VALUES (?,?)";
        foreach ($testData as $tdata) {
            try {
                $this->db->Execute($sql, $tdata);
            } catch (\Exception $e) {
                throw new \Exception($e->getMessage());
            }
         }
    }

    public function remove()
    {
        try {
            $sql = 'DELETE FROM cms_seometadatas WHERE url=? or url LIKE "%(copy)%"';
            $this->db->Execute($sql, '/php-unit-test');
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
