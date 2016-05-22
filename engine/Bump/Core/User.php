<?php
/**
 * This file is part of Bump 6.0 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 *
 */
namespace Bump\Core;

class User
{

    use \Bump\Traits\Singleton, \Bump\Traits\Context;

    public function init()
    {
        $lang = $this->getReqVar("lang", "string");

        $this->session = CMS::Session();
        if (!$this->session->isItem('lang')) {
            $this->session->setItem('lang', DEFAULT_LANGUAGE);
        }

        if (!empty($lang)) {

            $engine = rtrim(ENGINEDIR, DIRECTORY_SEPARATOR);
            $path = implode(DIRECTORY_SEPARATOR, [$engine, 'Bump', 'Lang']);
            $langs = [];
            foreach (scandir($path) as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) == 'php') {
                    $langs[] = strtolower(pathinfo($file, PATHINFO_FILENAME));
                }
            }

            if (!in_array(strtolower($lang), $langs)) {
                $lang = DEFAULT_LANGUAGE;
            }

            $lang = ucfirst($lang);

            $_COOKIE['lang'] = $lang;
            $this->session->setItem('lang', $lang);
        }
    }

    public function registerUser($profile)
    {
        $this->session->setItem("last_activity", time());
        $this->session->setItem("cmsuser", (object)$profile);
    }

    public function getUserProfile()
    {
        $user = $this->session->getItem("cmsuser");
        CMS::Config()->currentUser = $user;

        return CMS::Config()->currentUser;
    }

    public function unregisterUser()
    {
        $this->session->clearAll();
    }

    public function getUserLevel()
    {
        return intval($this->session->getItem("cmsuser")->user_level);
    }

    public function getLang()
    {
        return $this->session->getItem("lang");
    }

    public function isRegistered()
    {
        return $this->session->getItem("cmsuser")->user_id;
    }

    public function getID()
    {
        return $this->session->getItem("cmsuser")->user_id;
    }

    public function getUserLogin()
    {
        return $this->session->getItem("cmsuser")->user_login;
    }

    public function getUserName()
    {
        return $this->session->getItem("cmsuser")->user_name;
    }

    public function getEnableProfile()
    {
        return $this->session->getItem("cmsuser")->user_enable_profile == 'true' ? true : false;
    }

    public function getUserGroup()
    {
        return $this->session->getItem("cmsuser")->user_group;
    }

    public function getUserLevelGroup()
    {
        return $this->session->getItem("cmsuser")->ug_id;
    }
}
