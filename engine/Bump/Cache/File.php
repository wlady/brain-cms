<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Cache;

class File extends Cache
{
    public $cachePath = null;
    public $cacheFileSuffix = '.cache';
    public $directoryLevel = 0;
    private $gcProbability = 100;
    private $gced = false;

    public function __construct()
    {
        $this->initialize();
    }

    public function initialize()
    {
        parent::initialize();
        if (!$this->cachePath) {
            $this->cachePath = CACHE_DIR;
        }
        if (!is_dir($this->cachePath)) {
            mkdir($this->cachePath, 0755, true);
        }
    }

    public function getGCProbability()
    {
        return $this->gcProbability;
    }

    public function setGCProbability($value)
    {
        $value = (int)$value;
        if ($value < 0) {
            $value = 0;
        }
        if ($value > 1000000) {
            $value = 1000000;
        }
        $this->gcProbability = $value;
    }

    public function flush()
    {
        return $this->gc(false);
    }

    protected function getValue($key)
    {
        $cacheFile = $this->getCacheFile($key);
        if (($time = @filemtime($cacheFile)) > time()) {
            $fd = fopen($cacheFile, 'r');
            if (!flock($fd, LOCK_SH)) {
                return false;
            } else {
                $stat = fstat($fd);
                $content = fread($fd, $stat['size']);
            }
            flock($fd, LOCK_UN);
            fclose($fd);
            if ($this->serializer) {
                $data = igbinary_unserialize($content);
            } else {
                $data = unserialize($content);
            }
            if ($content === false || $data === false) {
                return false;
            }

            return $content;
        } elseif ($time > 0) {
            @unlink($cacheFile);
        }
        return false;
    }

    protected function setValue($key, $value, $expire)
    {
        if (!$this->gced && mt_rand(0, 1000000) < $this->gcProbability) {
            $this->gc();
            $this->gced = true;
        }
        if ($expire <= 0) {
            $expire = 31536000; // 1 year
        }
        $expire += time();
        $cacheFile = $this->getCacheFile($key);
        if ($this->directoryLevel > 0) {
            @mkdir(dirname($cacheFile), 0755, true);
        }
        if (@file_put_contents($cacheFile, $value, LOCK_EX) == strlen($value)) {
            @chmod($cacheFile, 0644);

            return @touch($cacheFile, $expire);
        } else {
            return false;
        }
    }

    protected function addValue($key, $value, $expire)
    {
        $cacheFile = $this->getCacheFile($key);
        if (@filemtime($cacheFile) > time()) {
            return false;
        }
        return $this->setValue($key, $value, $expire);
    }

    protected function deleteValue($key)
    {
        $cacheFile = $this->getCacheFile($key);
        return @unlink($cacheFile);
    }

    protected function getCacheFile($key)
    {
        if ($this->directoryLevel > 0) {
            $base = $this->cachePath;
            for ($i = 0; $i < $this->directoryLevel; ++$i) {
                if (($prefix = substr($key, $i + $i, 2)) !== false) {
                    $base .= DIRECTORY_SEPARATOR . $prefix;
                }
            }

            return $base . DIRECTORY_SEPARATOR . $key . $this->cacheFileSuffix;
        } else {
            return $this->cachePath . DIRECTORY_SEPARATOR . $key . $this->cacheFileSuffix;
        }
    }

    protected function gc($expiredOnly = true, $path = null)
    {
        if ($path === null) {
            $path = $this->cachePath;
        }
        if (is_file($path)) {
            if (is_writable($path)) {
                if (@unlink($path)) {
                    return true;
                }
            }
            return false;
        }
        if (is_dir($path)) {
            if (is_writeable($path)) {
                foreach (new \DirectoryIterator($path) as $_res) {
                    if ($_res->isDot()) {
                        unset($_res);
                        continue;
                    }
                    if ($_res->isFile()) {
                        $this->gc($expiredOnly, $_res->getPathName());
                    } elseif ($_res->isDir()) {
                        $this->gc($expiredOnly, $_res->getRealPath());
                    }
                    unset($_res);
                }
                /*if (@rmdir($path)) {
                    return true;
                }*/
            }
            return false;
        }
    }
}
