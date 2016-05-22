<?php

namespace Bump\Modules\Mailchimp\Tests\Fixtures;

class MailchimpFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $sql = 'UPDATE cms_modules SET m_settings=? WHERE m_path="Mailchimp"';
        $this->db->Execute($sql, 'a:8:{s:5:"Title";s:9:"Mailchimp";s:7:"Version";s:3:"6.0";s:6:"Author";a:1:{i:0;s:45:"Maksym Aksentiev <maksym@od.bumpnetworks.com>";}s:9:"Publisher";s:18:"Bump Networks, Inc";s:7:"Release";s:31:"Mon, 23 Mar 2015 14:21:45 +0000";s:11:"Description";s:9:"Mailchimp";s:5:"Panel";s:7:"content";s:8:"Settings";a:2:{i:0;a:4:{s:4:"name";s:17:"settings[api_key]";s:10:"fieldLabel";s:7:"API Key";s:5:"xtype";s:9:"textfield";s:5:"value";s:37:"c8ca0bf9f222b0910ae8c71fd01327da-us10";}i:1;a:4:{s:4:"name";s:24:"settings[active_list_id]";s:10:"fieldLabel";s:14:"Active List ID";s:5:"xtype";s:9:"textfield";s:5:"value";s:10:"bf6bda3fcb";}}}');
    }

    public function remove()
    {
    }
}
