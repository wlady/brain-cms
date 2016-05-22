<?php
namespace Bump\Modules\Albums\Tests\Fixtures;

class AlbumsFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            ['PHP Unit Test Album', 'php-unit-test-album', 0, 'true', 0, 'Test description'],
        ];
        $sql = 'INSERT INTO `cms_albums` (`c_title`, `c_slug`, `c_order`, `c_active`, `c_parent`, `c_description`) VALUES (?,?,?,?,?,?)';
        foreach ($testData as $tdata){
            try{
                $this->db->Execute($sql, $tdata);
            } catch (\Exception $e) {
                print($e->getMessage());
            }
        }
    }

    public function remove()
    {
        $sql = 'DELETE FROM cms_albums WHERE c_title=?';
        try {
            $this->db->Execute($sql, 'PHP Unit Test Album');
        } catch (\Exception $e) {
            print($e->getMessage());
        }
    }
}
