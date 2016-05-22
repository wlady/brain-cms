<?php

namespace Bump\Modules\UserFiles\Utils;

class ZipList
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
        if (!extension_loaded('zip')) {
            throw new \Exception('zip_list requires zip extension to be installed/loaded.');
        }
    }

    public function getDir($file)
    {
        $this->archive = zip_open($file);
        if (is_resource($this->archive)) {
            while ($zip_entry = zip_read($this->archive)) {
                $this->entries[] = [
                    'path' => zip_entry_name($zip_entry),
                    'size' => zip_entry_filesize($zip_entry),
                    'compressed' => zip_entry_compressedsize($zip_entry),
                    'method' => zip_entry_compressionmethod($zip_entry),
                    'parent' => ''
                ];
            }
            zip_close($this->archive);
        } else {
            return false;
        }
        return $this->entries;
    }

    public function extract($file, $path)
    {
        $this->archive = new \ZipArchive;
        if ($this->archive->open($file) !== true) {
            throw new \Exception('Could not open ZIP file ');
        }
        $this->archive->extractTo($path);
        $this->archive->close();
    }
}
