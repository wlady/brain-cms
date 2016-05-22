<?php

namespace Bump\Modules\UserFiles\Utils;

class TarList
{
    protected $entries = [
        [
            'path' => '/',
            'size' => 0,
            'compressed' => 0,
            'method' => 'autoloaded',
            'parent' => -1,
            'id' => 0,
            'dir' => true
        ]
    ];
    protected $archive = null;

    public function __construct()
    {
        require_once __DIR__ . '/../lib/tar.class.php';
    }

    public function getDir($file)
    {
        $this->archive = new \tar();
        if (!$this->archive->openTar($file, false)) {
            return false;
        }
        if ($this->archive->numDirectories > 0) {
            foreach ($this->archive->directories as $id => $information) {
                if ($information['name'] && !preg_match('~^\.\/~',
                        $information['name'])
                ) {
                    $this->entries[] = [
                        'path' => $information['name'],
                        'size' => 0,
                        'compressed' => 0,
                        'method' => '',
                        'parent' => '',
                        'dir' => true
                    ];
                }
            }
        }
        if ($this->archive->numFiles > 0) {
            foreach ($this->archive->files as $id => $information) {
                if ($information['name'] && !preg_match('~^\.\/~',
                        $information['name'])
                ) {
                    $this->entries[] = [
                        'path' => $information['name'],
                        'size' => $information['size'],
                        'compressed' => $information['size'],
                        'method' => '',
                        'parent' => '',
                        'dir' => false
                    ];
                }
            }
        }
        return $this->entries;
    }

    public function extract($file, $path)
    {
        $this->archive = new \tar();
        if (!$this->archive->openTar($file, false)) {
            throw new \Exception('Could not open TAR file ');
        }
        if ($this->archive->numFiles > 0) {
            foreach ($this->archive->files as $id => $information) {
                if ($information['name'] && !preg_match('~^\.\/~',
                        $information['name'])
                ) {
                    $pathinfo = pathinfo($path . '/' . $information['name']);
                    if (!is_dir($pathinfo['dirname'])) {
                        mkdir($pathinfo['dirname'], 0755, true);
                    }
                    file_put_contents($path . '/' . $information['name'],
                        $information['file']);
                }
            }
        }
    }
}
