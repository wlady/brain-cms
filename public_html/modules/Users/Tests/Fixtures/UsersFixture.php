<?php

namespace Bump\Modules\Users\Tests\Fixtures;

use Bump\Tests\Fixture;

class UsersFixture extends Fixture
{
    public function load()
    {
        try {
            $user = [
                'user_type' => 'Single',
                'user_login' => '',
                'ug_id' => '1',
                'user_name' => 'Single Test User',
                'user_password' => 'bad_pass',
                'user_last_login' => null,
                'user_email' => 'php@unit-testing.konturlabs.com',
                'user_registered' => '1990-01-01',
                'user_theme' => 'bcms7',
                'user_editor' => 'tinymce',
                'user_layout' => 'bcms7',
                'user_iconsize' => '48',
                'user_debug' => 'false',
                'user_customizable' => 'true',
                'user_active' => 'false'
            ];
            $profile = [
                'u_login' => 'single_correct_user',
                'u_type' => 'Single',
                'u_hash' => '33a5104d2a4707a7a7869e82155ec412',
                'u_settings' => 'a:5:{s:10:"user_theme";s:5:"bcms7";s:11:"user_editor";s:7:"tinymce";s:11:"user_layout";s:5:"bcms7";s:13:"user_iconsize";s:2:"48";s:10:"user_debug";s:5:"false";}'
            ];

            $sql = 'INSERT INTO `cms_users`
                (`user_type`, `user_login`, `ug_id`, `user_name`, `user_password`, `user_last_login`, `user_email`,
                `user_registered`, `user_theme`, `user_editor`, `user_layout`, `user_iconsize`, `user_debug`,
                `user_customizable`, `user_active`) VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            $this->db->Execute($sql, $user);
            $sql = 'INSERT INTO `cms_users_profiles`
                (`u_login`, `u_type`, `u_hash`, `u_settings`) VALUES
                (?, ?, ?, ?)';
            $this->db->Execute($sql, $profile);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    public function remove()
    {
        try {
            $sql = 'DELETE FROM cms_users WHERE `user_name`=?';
            $this->db->Execute($sql, 'Single Test User');
            $sql = 'DELETE FROM cms_users_profiles WHERE `u_login`=?';
            $this->db->Execute($sql, 'single_correct_user');
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
