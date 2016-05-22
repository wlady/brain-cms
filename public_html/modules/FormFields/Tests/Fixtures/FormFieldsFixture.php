<?php

namespace Bump\Modules\FormFields\Tests\Fixtures;

class FormFieldsFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            ['Name', 'text', 'false'],
            ['EMail', 'email', 'false'],
            ['Phone', 'text', 'true'],
            ['Agree', 'checkbox', 'false'],
            ['warnings', 'checkbox', 'true'],
            ['errors', 'checkbox', 'true'],
            ['code', 'text', 'true'],
            ['Message', 'text', 'true'],
            ['Method', 'text', 'true'],
         ];
        $sql = 'SELECT id FROM cms_forms WHERE name=?';
        if ($formId = $this->db->getOne($sql, 'PHPUnit Test Form')) {
            array_walk($testData, function(&$item) use ($formId) {
                array_unshift($item, $formId);
            });
            $sql = 'INSERT INTO `cms_form_fields` (`fform`, `fname`, `ftype`, `fempty`) VALUES (?,?,?,?)';
            foreach ($testData as $tdata) {
                try {
                    $this->db->Execute($sql, $tdata);
                } catch (\Exception $e) {
                    print($e->getMessage());
                }
            }
        }
    }

    public function remove()
    {
        $sql = 'DELETE FROM cms_forms WHERE name=?';
        try {
            $this->db->Execute($sql, 'PHPUnit Test Form');
        } catch (\Exception $e) {
            print($e->getMessage());
        }
    }
}
