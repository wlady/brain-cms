<?php

namespace Bump\Modules\Auth;

use Bump\Core\CMS;

class Auth extends \Bump\Core\Module
{
    public $providers = [];

    public function __construct($providers = [])
    {
        $providers = array_unique($providers);
        foreach ($providers as $provider) {
            $this->providers[strtolower($provider)] = $provider;
        }
    }

    public function add($provider)
    {
        if (!in_array($provider, $this->providers)) {
            $this->providers[] = $provider;
        }
    }

    public function remove($provider)
    {
        if (($key = array_search($provider, $this->providers)) !== false) {
            unset($this->providers[$key]);
        }
    }

    public function auth()
    {
        $args = func_get_arg(0);
        $login = $this->getReqVar('login', 'text', $args);
        $password = $this->getReqVar('password', 'text', $args);
        $providers = CMS::Config()->authProviders->providers;

        if ($login && $password && $providers) {

            if (strpos($login, ':') !== false) {
                list($shortcut, $login) = explode(':', $login);
                $shortcut = strtolower($shortcut);
                $args['login'] = $login;
                if (isset($providers[$shortcut])) {
                    $providers = [$providers[$shortcut]];
                }
            }
        }

        foreach ($providers as $provider) {
            $providerClassName = '\\Bump\\Auth\\' . $provider;
            if (class_exists($providerClassName)) {
                $module = new $providerClassName;
                if (method_exists($module, 'auth')) {
                    if ($module->auth($args)) {
                        return ['success' => true];
                    }
                }
            }
        }

        return ['success' => false];
    }

    public function unAuth()
    {
        CMS::User()->unregisterUser();
        return ['success' => true];
    }

    public function isAuth()
    {
        $result = false;
        $user = CMS::User();
        if ($user->isRegistered()) {
            if ((CMS::Session()->getItem('last_activity') + INACTIVITY_TIMEOUT) > time()) {
                $result = true;
            }
        }
        if (!$result) {
            $user->unregisterUser();
        }
        return ['success' => $result];
    }

    public function checkAccess($module = '')
    {
        return true;
    }
}
