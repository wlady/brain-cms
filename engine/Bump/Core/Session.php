<?php
/**
 * This file is part of Bump 6.0 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 *
 */
namespace Bump\Core;

class Session
{
    use \Bump\Traits\Singleton, \Bump\Traits\Context;

    protected $data = [];
    protected $code = null;

    public function init()
    {
        $this->code = md5(CMS::Config()->BASEURL);
        if ($this->isAjax()) {
            session_cache_limiter('nocache');
        } else {
            session_cache_limiter('private_no_expire');
            session_cache_expire(30);
        }
        // @codeCoverageIgnoreStart
        if (!session_id()) {
            if (!strcasecmp(ini_get('session.save_handler'), 'files') && defined('SESSION_PATH')) {
                session_save_path(SESSION_PATH);
            }
            $sid = $this->getReqVar('sid', 'text');
            if (isset($sid)) {
                session_id($sid);
            }
        }
        // @codeCoverageIgnoreEnd
        session_start();
        $this->loadData();
    }

    /**
     * @codeCoverageIgnore
     */
    private function loadData()
    {
        if (isset($_SESSION[$this->code])) {
            $this->data = unserialize($_SESSION[$this->code]);
        }
    }

    /**
     * @codeCoverageIgnore
     */
    private function saveData()
    {
        $_SESSION[$this->code] = serialize($this->data);
    }

    public function isItem($name)
    {
        return isset($this->data[$name]) ? true : false;
    }

    public function getItem($name)
    {
        return $this->isItem($name) ? $this->data[$name] : false;
    }

    public function setItem($name, $value)
    {
        $this->data[$name] = $value;
        $this->saveData();
    }

    public function clearItem($name)
    {
        if ($this->isItem($name)) {
            $this->data[$name] = '';
            unset($this->data[$name]);
            $this->saveData();
        }
    }

    public function clearAll()
    {
        if (count($this->data)) {
            foreach ($this->data as $key => $item) {
                $this->clearItem($key);
            }
        }
    }

    public function getSID()
    {
        return session_id();
    }
}
