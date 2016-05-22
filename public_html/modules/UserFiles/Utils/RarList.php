<?php

namespace Bump\Modules\UserFiles\Utils;

class RarList
{
    private $entries = [
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
    private $archive = null;

    public function __construct()
    {
        if (!extension_loaded('rar')) {
            throw new \Exception('rar_list requires PECL rar extension to be installed/loaded.');
        }
    }

    public function getDir($file)
    {
        $this->archive = rar_open($file);
        if (($rar_entries = RarList($this->archive)) === false) {
            return false;
        }
        foreach ($rar_entries as $entry) {
            $name = $entry->getName();
            if ($entry->isDirectory()) {
                $name .= '/';
            }
            $this->entries[] = [
                'path' => $name,
                'size' => $entry->getUnpackedSize(),
                'compressed' => $entry->getPackedSize(),
                'method' => $entry->getMethod(),
                'parent' => ''
            ];
        }
        rar_close($this->archive);
        return $this->entries;
    }

    public function extract($file, $path)
    {
        $this->archive = rar_open($file);
        if (($list = RarList($this->archive)) !== false) {
            foreach ($list as $file) {
                $entry = rar_entry_get($this->archive, $file->getName());
                $entry->extract($path);
            }
        }
        rar_close($this->archive);
    }
}
