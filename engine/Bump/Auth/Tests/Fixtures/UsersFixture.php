<?php

namespace Bump\Auth\Tests\Fixtures;

use Bump\Tests\Fixture;

class UsersFixture extends Fixture
{
    public function load()
    {
        try {
            $user = [
                'user_type' => 'Users',
                'user_login' => 'phpunittest',
                'ug_id' => '1',
                'user_name' => 'phpunittest',
                'user_password' => password_hash('password', PASSWORD_DEFAULT),
                'user_last_login' => null,
                'user_email' => 'php@unit-testing.konturlabs.com',
                'user_registered' => '1990-01-01',
                'user_theme' => 'neptune',
                'user_editor' => 'tinymce',
                'user_layout' => 'classic',
                'user_iconsize' => '64',
                'user_debug' => 'true',
                'user_customizable' => 'true',
                'user_active' => 'true'
            ];
            $profile = [
                'u_login' => 'phpunittest',
                'u_type' => 'Users',
                'u_hash' => 'be91688eeb8c59bd949b490be1ead02b',
                'u_settings' => 'a:5:{s:10:"user_theme";s:7:"neptune";s:11:"user_editor";s:7:"tinymce";s:11:"user_layout";s:7:"classic";s:13:"user_iconsize";s:2:"32";s:10:"user_debug";s:5:"false";}',
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
            $this->db->Execute($sql, 'phpunittest');
            $sql = 'DELETE FROM cms_users_profiles WHERE `u_login`=?';
            $this->db->Execute($sql, 'phpunittest');
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }
}
