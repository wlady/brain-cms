<?php

namespace Bump\Modules\UserFiles;

use Bump\Cache\File as BCMSFileCache;

class UserFiles extends \Bump\Core\Module
{
    protected static $settings = [];
    private $base = UPLOADDIR;
    private $files = [];
    private $dirs = [];
    private $sysdirs = [];
    private $sort = "name";
    private $dir = "ASC";
    private $start = 0;
    private $limit = 50;
    private $path = "";
    private $curPath = "";
    public $search = "";
    private $protectedDirs = [
        IMG_LIBRARY,
        FLASH_LIBRARY,
        DOCS_LIBRARY,
        MEDIA_LIBRARY,
    ];

    public function init()
    {
        if ($data = self::getModuleSettings(get_class())) {
            self::$settings = $data;
        }
        if (!self::$settings['format']) {
            self::$settings['format'] = 'png';
        }
    }

    public function getAllDirs()
    {
        $nodes = [];
        $this->getDir($this->base, $nodes);
        return $nodes;
    }

    protected function getDir($path, &$nodes)
    {
        $objects = scandir($path);
        if (sizeof($objects) > 0) {
            foreach ($objects as $file) {
                // skip hidden files
                if (preg_match('~^\.~', $file)) {
                    continue;
                }
                // go on
                $fname = str_replace('//', '/', $path . DIRECTORY_SEPARATOR . $file);
                if (!preg_match('~/$~', $fname)) {
                    $fname .= '/';
                }
                if (is_dir($fname)) {
                    $entry = [
                        'text'         => $file,
                        'id'           => substr($fname, strlen(UPLOADDIR)),
                        'iconCls'      => 'ic-nodeClosed',
                        'allowChidren' => true,
                        'allowDrop'    => true,
                        'children'     => [],
                    ];
                    if (in_array($fname, $this->protectedDirs)) {
                        $entry['iconCls'] = 'ic-nodeLocked';
                    } else {
                        $entry['checked'] = false;
                    }
                    $this->getDir($fname, $entry['children']);
                    $files = scandir($fname);
                    $nodes[] = $entry;
                }
            }
        }
    }

    public function getFiles()
    {
        clearstatcache();
        $this->path = $this->getReqVar("path", "text");
        $sortBy = $this->getReqVar("sortBy", "json");
        $this->dir = $this->getReqVar("dir", "text");
        if (!$sortBy) {
            $this->sort = 'name';
            $this->dir = 'ASC';
        } else {
            if (is_array($sortBy)) {
                $sortBy = $sortBy[0];
            }
            $this->sort = $sortBy->property;
            $this->dir = $sortBy->direction;
        }
        if (!$this->path) {
            $this->path = '/';
        }
        // dir for cached meta data & previews
        $cachePath = UPLOADDIR . $this->path . '/.data/';
        if (!file_exists($cachePath)) {
            mkdir($cachePath);
        }
        $cache = new BCMSFileCache();
        $cache->cachePath = $cachePath;
        $this->listFiles();
        $this->filterFiles();
        $this->sortFiles();
        $this->sortDirs();
        $totalDirs = count($this->sysdirs) + count($this->dirs);
        $totalFiles = count($this->files);
        $data = [];
        if (!$this->chroot) {
            foreach ($this->sysdirs as $file) {
                $data[] = $file;
            }
            foreach ($this->dirs as $file) {
                $data[] = $file;
            }
        }
        foreach ($this->files as $file) {
            $data[] = $file;
        }
        $parseMedia = false;
        if (defined('FFMPEG')) {
            $parseMedia = true;
            $config = new \PHPVideoToolkit\Config(
                [
                    'temp_directory' => TMPDIR,
                    'ffmpeg'         => FFMPEG,
                    'ffprobe'        => FFPROBE,
                ]
            );
            $parser = new \PHPVideoToolkit\MediaParser($config);
        }
        foreach ($data as &$item) {
            $item['type'] = 'unknown';
            if ($ext = self::isImageFile($item['name'])) {
                $item['extension'] = $ext;
                $item['type'] = 'image';
                $sz = @getimagesize(DOMAINDIR . $item['path']);
                $item['width'] = $sz[0];
                $item['height'] = $sz[1];
                $item['icon'] = "/thumb/?src=" . $item['path'] . "&hash=" . md5($item['path']) . "&w=100&h=100&zc=1";
                $item['url'] = "/thumb/?src=" . $item['path'] . "&hash=" . md5($item['path']);
            } else {
                if ($ext = self::isArchiveFile($item['name'])) {
                    $item['extension'] = $ext;
                    $item['type'] = 'archive';
                    $item['icon'] = '/thumb/?src=/modules/UserFiles/ux/img/types/archive.png';
                } else {
                    if ($ext = self::isVideoFile($item['name'])) {
                        $item['extension'] = $ext;
                        $item['type'] = 'video';
                        $item['icon'] = '/thumb/?src=/modules/UserFiles/ux/img/types/video.png';
                        if ($parseMedia) {
                            if (!($info = $cache->get(DOMAINDIR . $item['path']))) {
                                $info = $parser->getFileInformation(DOMAINDIR . $item['path']);
                                $cache->set(DOMAINDIR . $item['path'], $info);
                            }
                            if ($info) {
                                $pathinfo = pathinfo(DOMAINDIR . $item['path']);
                                // extract preview
                                $relName = UPLOADPATH . $this->path . "/.data/" . $pathinfo['basename'] . ".jpg";
                                $picName = DOMAINDIR . $relName;
                                if (!is_file($picName)) {
                                    try {
                                        $video = new \PHPVideoToolkit\Video(DOMAINDIR . $item['path'], $config);
                                        $frame = intval(($info['duration']->hours * 360 + $info['duration']->minutes
                                                * 60 + $info['duration']->seconds) / 2);
                                        $video->extractFrame(new \PHPVideoToolkit\Timecode($frame,
                                            \PHPVideoToolkit\Timecode::INPUT_FORMAT_SECONDS))->save($picName);
                                    } catch (Exception $e) {
                                        //flog($e->getMessage());
                                    }
                                }
                                $item['icon'] = "/thumb/?src=" . $relName . "&hash=" . md5($relName) . "&w=100&h=100&zc=1";
                                $item['option']['common'] = [
                                    'duration' => sprintf("%02d:%02d:%02d",
                                        $info['duration']->hours,
                                        $info['duration']->minutes,
                                        $info['duration']->seconds),
                                ];
                                if ($info['video']) {
                                    $item['option']['video'] = [
                                        'width'  => $info['video']['dimensions']['width'],
                                        'height' => $info['video']['dimensions']['height'],
                                        'vcodec' => $info['video']['codec']['raw'],
                                    ];
                                }
                                if ($info['audio']) {
                                    $item['option']['audio'] = [
                                        'freq'     => $info['audio']['sample']['rate'],
                                        'acodec'   => $info['audio']['codec']['raw'],
                                        'channels' => $info['audio']['channels'],
                                    ];
                                }
                            }
                        }
                    } else {
                        if ($ext = self::isAudioFile($item['name'])) {
                            $item['extension'] = $ext;
                            $item['type'] = 'audio';
                            $item['icon'] = '/thumb/?src=/modules/UserFiles/ux/img/types/audio.png';
                            if ($parseMedia) {
                                if (!($info = $cache->get(DOMAINDIR . $item['path']))) {
                                    $info = $parser->getFileInformation(DOMAINDIR . $item['path']);
                                    $cache->set(DOMAINDIR . $item['path'], $info);
                                }
                                if ($info) {
                                    $item['option']['common'] = [
                                        'duration' => sprintf("%02d:%02d:%02d",
                                            $info['duration']->hours,
                                            $info['duration']->minutes,
                                            $info['duration']->seconds),
                                    ];
                                    if ($info['audio']) {
                                        $item['option']['audio'] = [
                                            'freq'     => $info['audio']['sample']['rate'],
                                            'acodec'   => $info['audio']['codec']['raw'],
                                            'channels' => $info['audio']['channels'],
                                        ];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $response = [
            'version' => 1,
            'path'    => str_replace(['///', '//'], '/', UPLOADPATH . $this->path),
            'data'    => $data,
            'total'   => count($data),
            'success' => true,
        ];

        return $response;
    }

    public function getPathFiles()
    {
        $this->path = $this->getReqVar("path", "text");
        $this->dir = $this->getReqVar("dir", "text");
        $this->start = 0;
        $this->limit = 100;
        $this->sort = 'name';
        $this->dir = 'ASC';
        if (!$this->path) {
            $this->path = '/';
        }
        $this->listFilesOnly();
        $this->sortFiles();

        return $this->files;
    }

    public function moveDir()
    {
        $dest = $this->getReqVar("dest", "text");
        $target = $this->getReqVar("target", "text");
        $dest = UPLOADDIR . $dest;
        if (!preg_match('~/$~', $dest)) {
            $dest .= '/';
        }
        $target = UPLOADDIR . $target;
        if (!preg_match('~/$~', $target)) {
            $target .= '/';
        }
        if (!in_array($dest, $this->protectedDirs)) {
            $cmd = "mv \"" . $dest . "\" \"" . $target . "\"";
            passthru($cmd);
        } else {
            return [
                'success' => false,
                'message' => 'Protected directory cannot be moved',
            ];
        }

        return ['success' => true];
    }

    public function deleteFiles()
    {
        $path = $this->getReqVar("path", "text");
        $names = $this->getReqVar("names", "json");
        $cache = new BCMSFileCache();
        $cachePath = DOMAINDIR . UPLOADPATH . $path . "/.data/";
        $cache->cachePath = $cachePath;
        $protected = false;
        foreach ($names as $name) {
            $fname = realpath(DOMAINDIR . UPLOADPATH . $path . '/' . $name);
            if (is_dir($fname)) {
                if (!preg_match('~/$~', $fname)) {
                    $fname .= '/';
                }
                if (!in_array($fname, $this->protectedDirs)) {
                    $cmd = "rm -rf \"" . $fname . "\"";
                    passthru($cmd);
                } else {
                    $protected = true;
                }
            } else {
                if (is_file($fname)) {
                    if ($ext = self::isVideoFile($fname)) {
                        $absName = $cachePath . $name . ".jpg";
                        unlink($name);
                        $cache->flush($fname);
                    } else {
                        if ($ext = self::isAudioFile($fname)) {
                            $cache->flush($fname);
                        }
                    }
                    $cmd = "rm -f \"" . $fname . "\"";
                    passthru($cmd);
                }
            }
        }
        $info = !$protected ? "" : 'Protected directory cannot be deleted';

        return [
            'success' => true,
            'message' => $info,
        ];
    }

    public function deleteDirs()
    {
        $names = $this->getReqVar("names", "json");
        $protected = false;
        foreach ($names as $path) {
            $tmp = realpath(UPLOADDIR . $path);
            if (!preg_match('~/$~', $tmp)) {
                $tmp .= '/';
            }
            if (!in_array($tmp, $this->protectedDirs)) {
                $cmd = "rm -Rf \"" . $tmp . "\"";
                passthru($cmd);
            } else {
                $protected = true;
            }
        }
        $info = !$protected ? "" : 'Protected directory cannot be deleted';

        return [
            'success' => true,
            'message' => $info,
        ];
    }

    public function copyFiles()
    {
        $path = $this->getReqVar("path", "text");
        $files = $this->getReqVar("files", "json");
        foreach ($files as $file) {
            $src = pathinfo(DOMAINDIR . $file);
            if (is_file(UPLOADDIR . $path . $src['basename'])) {
                return [
                    'success' => false,
                    'message' => 'File ' . UPLOADPATH . $path . $src['basename'] . ' is already exists',
                ];
            }
        }
        foreach ($files as $file) {
            $cmd = "cp \"" . DOMAINDIR . $file . "\" \"" . UPLOADDIR . $path . "\"";
            passthru($cmd);
        }

        return ['success' => true];
    }

    public function copyDir()
    {
        $src = $this->getReqVar("src", "text");
        $dst = $this->getReqVar("dst", "text");
        $exists = false;
        $pathinfo = '';
        if (!$dst) {
            $pathinfo = pathinfo(UPLOADDIR . $src);
            if (is_dir(UPLOADDIR . $pathinfo['basename'])) {
                $exists = true;
            }
        } else {
            if (is_dir(UPLOADDIR . $dst . $src)) {
                $pathinfo = pathinfo(UPLOADDIR . $dst);
                $exists = true;
            }
        }
        if ($exists) {
            return [
                'success' => false,
                'message' => 'Directory ' . UPLOADPATH . $pathinfo['basename'] . ' is already exists',
            ];
        }
        $cmd = "cp -r \"" . UPLOADDIR . $src . "\" \"" . UPLOADDIR . $dst . "\"";
        passthru($cmd);

        return ['success' => true];
    }

    public function createDir()
    {
        $path = $this->getReqVar("path", "text");
        $name = $this->getReqVar("name", "text");
        if (preg_match('/^\./', $name)) {
            return [
                'success' => false,
                'message' => 'You cannot create hidden directories',
            ];
        }
        $tmp = realpath(UPLOADDIR . $path) . '/' . $name;
        if (is_dir($tmp)) {
            return [
                'success' => false,
                'message' => 'Directory already exists',
            ];
        }
        mkdir($tmp);

        return [
            'success' => true,
            'message' => $path . $name . '/',
        ];
    }

    protected function getFlatDir($path)
    {
        $objects = scandir($path);
        if (sizeof($objects) > 0) {
            foreach ($objects as $file) {
                // skip hidden files
                if (preg_match('~^\.~', $file)) {
                    continue;
                }
                // go on
                $fname = realpath($path . DIRECTORY_SEPARATOR . $file);
                if (!preg_match('~/$~', $fname)) {
                    $fname .= '/';
                }
                if (is_dir($fname)) {
                    $this->list[] = $fname;
                    $this->getFlatDir($fname);
                }
            }
        }
    }

    public function searchFiles()
    {
        $list = [];
        $mask = $this->getReqVar("search", "text");
        if ($mask) {
            $offs = strlen(OWNDIR);
            $offs2 = strlen(UPLOADDIR);
            $this->list = [$this->base];
            $this->getFlatDir($this->base);
            foreach ($this->list as $dir) {
                $files = glob($dir . $mask);
                foreach ($files as $file) {
                    if (!is_dir($file)) {
                        $pathinfo = pathinfo($file);
                        $item = [
                            'inode'   => fileinode($file),
                            'type'    => 'unknown',
                            'name'    => $pathinfo['basename'],
                            'url'     => substr($file, $offs2,
                                -strlen($pathinfo['basename'])),
                            'path'    => substr($file, $offs),
                            'option'  => substr($file, $offs,
                                -strlen($pathinfo['basename'])),
                            'size'    => filesize($file),
                            'lastmod' => date('M d, Y H:i', filemtime($file)),
                            'dir'     => false,
                            'icon'    => '/thumb/?src=/modules/UserFiles/ux/img/types/unknown.png',
                        ];
                        $list[] = $item;
                    }
                }
            }
        }
        $response = [
            'version' => 1,
            'data'    => $list,
            'total'   => count($list),
            'success' => true,
        ];

        return $response;
    }

    public function downloadFiles()
    {
        $file = $this->getReqVar("file", "string");
        $filename = DOMAINDIR . $file;
        if (!is_file($filename)) {
            header("HTTP/1.0 403 Forbidden");
            exit;
        }
        $fsize = filesize($filename);
        $ftime = gmdate('r', filemtime($filename));
        $etag = md5($filename . $ftime . $fsize);
        $etag = substr($etag, 0, 8) . '-' . substr($etag, 8, 7) . '-' . substr($etag,
                15, 8);
        header('ETag: "' . $etag . '"');
        header("Content-Disposition: attachment; filename=" . basename($filename));
        header("Last-Modified: " . $ftime);
        header("Accept-Ranges: bytes");
        header('Content-Length: ' . $fsize);
        header("Content-type: application/octet-stream");
        header('Content-Transfer-Encoding: binary');
        if ($file = fopen($filename, 'rb')) {
            while ((!feof($file)) && (connection_status() == 0)) {
                print(fread($file, 1024 * 8));
                flush();
            }
            fclose($file);
        }
        exit();
    }

    public function createArchive()
    {
        $name = $this->getReqVar("name", "text");
        $path = $this->getReqVar("path", "text");
        $files = $this->getReqVar("files", "json_array");
        if (!$path) {
            $path = '/';
        }
        $fname = DOMAINDIR . $path . $name;
        $pathinfo = pathinfo($fname);
        if (!array_key_exists('extension', $pathinfo)) {
            $pathinfo['basename'] .= '.zip';
        } else {
            if ($pathinfo['extension'] != 'zip') {
                $pathinfo['basename'] .= '.zip';
            }
        }
        $fname = realpath(UPLOADDIR . $path) . '/' . $pathinfo['basename'];
        if (is_file($fname)) {
            return [
                'success' => false,
                'message' => 'File ' . $pathinfo['basename'] . ' is already exists',
            ];
        }
        if (count($files)) {
            $zip = new \ZipArchive();
            if ($zip->open($fname, \ZipArchive::CREATE) !== true) {
                return [
                    'success' => false,
                    'message' => 'Could not Create ' . $pathinfo['basename'],
                ];
            }
            foreach ($files as $file) {
                if (substr($file, 0, 1) == '/') {
                    $file = substr($file, 1);
                }
                $fname = UPLOADDIR . $path . $file;
                if (!is_readable($fname) || !$zip->addFile($fname, $file)) {
                    return [
                        'success' => false,
                        'message' => 'Error adding ' . $file . ' to ' . $pathinfo['basename'],
                    ];
                }
            }
            $zip->close();
        }

        return [
            'success' => true,
        ];
    }

    public function unpackArchive()
    {
        $file = $this->getReqVar("file", "text");
        $pathinfo = pathinfo(DOMAINDIR . $file);
        $type = '';
        if (array_key_exists('extension', $pathinfo)) {
            $type = $pathinfo['extension'];
        }
        if ($type && $file) {
            $class = '\\Bump\\Modules\\UserFiles\\Utils\\' . ucfirst(strtolower($type)) . "List";
            if (class_exists($class)) {
                $archive = new $class;
                $archive->extract(DOMAINDIR . $file, $pathinfo['dirname']);
            }
        }

        return [
            'success' => true,
        ];
    }

    public function archiveList()
    {
        $file = $this->getReqVar("path", "text");
        $pathinfo = pathinfo($file);
        $type = '';
        if (array_key_exists('extension', $pathinfo)) {
            $type = $pathinfo['extension'];
        }
        $list = [];
        if ($type && $file) {
            $class = '\\Bump\\Modules\\UserFiles\\Utils\\' . ucfirst(strtolower($type)) . "List";
            if (class_exists($class)) {
                $archive_tree = new $class;
                $this->entries = $archive_tree->getDir(DOMAINDIR . $file);
                if ($this->entries !== false) {
                    $list = $this->buildArchiveTree();
                }
            }
        }

        return $list;
    }

    private function buildArchiveTree()
    {
        foreach ($this->entries as $key => &$entry) {
            if ($entry['parent'] !== -1 && substr($entry['path'], -1) == '/') {
                $entry['dir'] = true;
                $current = "";
                $paths = explode('/', $entry['path']);
                if (count($paths) == 2 && $paths[1] == '') {
                    $entry['parent'] = 0;
                } else {
                    foreach ($paths as $path) {
                        if ($path) {
                            $current .= $path . '/';
                            $tmp = array_filter($this->entries,
                                function ($item) use ($current) {
                                    return ($item['path'] == $current) ? $item : null;
                                });
                            if (!count($tmp)) {
                                $this->entries[] = [
                                    'path'       => $current,
                                    'size'       => 0,
                                    'compressed' => 0,
                                    'method'     => 'generated',
                                    'parent'     => '',
                                    'dir'        => true,
                                ];
                            }
                        }
                    }
                }
            } else {
                if (substr($entry['path'], -1) !== '/') {
                    $pathinfo = pathinfo($entry['path']);
                    if ($pathinfo['dirname'] != '.') {
                        $current = $pathinfo['dirname'] . '/';
                        $tmp = array_filter($this->entries,
                            function ($item) use ($current) {
                                return ($item['path'] == $current) ? $item : null;
                            });
                        if (!count($tmp)) {
                            $this->entries[] = [
                                'path'       => $current,
                                'size'       => 0,
                                'compressed' => 0,
                                'method'     => 'generated',
                                'parent'     => '',
                                'dir'        => true,
                            ];
                        }
                    }
                }
            }
        }
        unset($entry);
        foreach ($this->entries as $key => &$entry) {
            $entry['id'] = $key;
            $pathinfo = pathinfo($entry['path']);
            $entry['name'] = $pathinfo['basename'];
            if ($entry['parent'] != -1) {
                $pathinfo = pathinfo($entry['path']);
                if ($pathinfo['dirname'] != '.') {
                    $path = $pathinfo['dirname'] . '/';
                } else {
                    $path = '/';
                }
                foreach ($this->entries as $pkey => $pentry) {
                    if ($pentry['path'] == $path) {
                        $entry['parent'] = $pkey;
                        break;
                    }
                }
            }
        }
        $levels = [];
        $this->buildRecursiveTreeLevel(0, $levels);

        return $levels;
    }

    private function buildRecursiveTreeLevel($parent, &$entry)
    {
        if ($rows = array_filter(
            $this->entries,
            function ($item) use ($parent) {
                return ($item['parent'] == $parent) ? $item : null;
            }
        )
        ) {
            foreach ($rows as $row) {
                $row['children'] = [];
                $this->buildRecursiveTreeLevel($row['id'], $row['children']);
                $item = $row;
                if (count($row['children'])) {
                    $item['children'] = $row['children'];
                } else {
                    unset($item['children']);
                    $item['leaf'] = true;
                }
                $entry[] = $item;
            }
        }
    }

    private static function safeTranslit($string)
    {
        $stranslit = [
            "Ґ"  => "g",
            "Ё"  => "yo",
            "Є"  => "e",
            "Ї"  => "yi",
            "І"  => "i",
            "і"  => "i",
            "ґ"  => "g",
            "ё"  => "yo",
            "№"  => "#",
            "є"  => "e",
            "ї"  => "yi",
            "А"  => "a",
            "Б"  => "b",
            "В"  => "v",
            "Г"  => "g",
            "Д"  => "d",
            "Е"  => "e",
            "Ж"  => "zh",
            "З"  => "z",
            "И"  => "i",
            "Й"  => "y",
            "К"  => "k",
            "Л"  => "l",
            "М"  => "m",
            "Н"  => "n",
            "О"  => "o",
            "П"  => "p",
            "Р"  => "r",
            "С"  => "s",
            "Т"  => "t",
            "У"  => "u",
            "Ф"  => "f",
            "Х"  => "h",
            "Ц"  => "ts",
            "Ч"  => "ch",
            "Ш"  => "sh",
            "Щ"  => "sch",
            "Ъ"  => "",
            "Ы"  => "yi",
            "Ь"  => "",
            "Э"  => "e",
            "Ю"  => "yu",
            "Я"  => "ya",
            "а"  => "a",
            "б"  => "b",
            "в"  => "v",
            "г"  => "g",
            "д"  => "d",
            "е"  => "e",
            "ж"  => "zh",
            "з"  => "z",
            "и"  => "i",
            "й"  => "y",
            "к"  => "k",
            "л"  => "l",
            "м"  => "m",
            "н"  => "n",
            "о"  => "o",
            "п"  => "p",
            "р"  => "r",
            "с"  => "s",
            "т"  => "t",
            "у"  => "u",
            "ф"  => "f",
            "х"  => "h",
            "ц"  => "ts",
            "ч"  => "ch",
            "ш"  => "sh",
            "щ"  => "sch",
            "ъ"  => "",
            '"'  => "",
            "ы"  => "yi",
            "ь"  => "",
            "э"  => "e",
            "ю"  => "yu",
            "я"  => "ya",
            "#"  => "_",
            "%"  => "_",
            " "  => "_",
            "/"  => "_",
            "\\" => "_",
            "$"  => "_",
            "@"  => "_",
            "^"  => "_",
            "&"  => "_",
            "*"  => "_",
            "{"  => "_",
            "}"  => "_",
            "~"  => "_",
            "["  => "_",
            "]"  => "_",
            "<"  => "_",
            ">"  => "_",
            "?"  => "_",
            "'"  => "_",
            'Š'  => 'S',
            'š'  => 's',
            'Ž'  => 'Z',
            'ž'  => 'z',
            'À'  => 'A',
            'Á'  => 'A',
            'Â'  => 'A',
            'Ã'  => 'A',
            'Ä'  => 'A',
            'Å'  => 'A',
            'Æ'  => 'A',
            'Ç'  => 'C',
            'È'  => 'E',
            'É'  => 'E',
            'Ê'  => 'E',
            'Ë'  => 'E',
            'Ì'  => 'I',
            'Í'  => 'I',
            'Î'  => 'I',
            'Ï'  => 'I',
            'Ñ'  => 'N',
            'Ò'  => 'O',
            'Ó'  => 'O',
            'Ô'  => 'O',
            'Õ'  => 'O',
            'Ö' => 'O',
            'Ø' => 'O',
            'Ù' => 'U',
            'Ú' => 'U',
            'Û' => 'U',
            'Ü' => 'U',
            'Ý' => 'Y',
            'Þ' => 'B',
            'ß' => 'Ss',
            'à' => 'a',
            'á' => 'a',
            'â' => 'a',
            'ã' => 'a',
            'ä' => 'a',
            'å' => 'a',
            'æ' => 'a',
            'ç' => 'c',
            'è' => 'e',
            'é' => 'e',
            'ê' => 'e',
            'ë' => 'e',
            'ì' => 'i',
            'í' => 'i',
            'î' => 'i',
            'ï' => 'i',
            'ð' => 'o',
            'ñ' => 'n',
            'ò' => 'o',
            'ó' => 'o',
            'ô' => 'o',
            'õ' => 'o',
            'ö' => 'o',
            'ø' => 'o',
            'ù' => 'u',
            'ú' => 'u',
            'û' => 'u',
            'ü' => 'u',
            'ý' => 'y',
            'þ' => 'b',
            'ÿ' => 'y',
        ];

        return strtr($string, $stranslit);
    }

    private function listFiles()
    {
        $dir = realpath(UPLOADDIR . $this->path);
        $realPath = rtrim(realpath($dir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $uploadRealPath = rtrim(realpath(UPLOADDIR), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (strstr($realPath, $uploadRealPath) === false) {
            return;
        }
        $this->curPath = substr($realPath, strlen($uploadRealPath));
        if ($this->curPath === false) {
            $this->curPath = '/';
        }
        $sorting = 0;
        if ($this->sort == 'name' && $this->dir == 'DESC') {
            $sorting = 1;
        }
        if ($d = @scandir($dir)) {
            foreach ($d as $name) {
                if (preg_match('/^\./', $name)) {
                    continue;
                }
                $lastmod = filemtime($realPath . $name);
                $inode = fileinode($realPath . $name);
                if (!$this->chroot && is_dir($realPath . $name)) {
                    $this->dirs[] = [
                        'inode'   => $inode,
                        'name'    => $name,
                        'dir'     => true,
                        'date'    => $lastmod,
                        'lastmod' => date('M d, Y H:i', $lastmod),
                        'icon'    => '/thumb/?src=/modules/UserFiles/ux/img/types/folder.png',
                        'url'     => '',
                        'path'    => str_replace('//', '/', $this->curPath . $name),
                    ];
                } else {
                    if (!is_dir($realPath . $name)) {
                        $size = filesize($realPath . $name);
                        $width = $height = $dims = '';
                        $icon = $url = '/thumb/?src=/modules/UserFiles/ux/img/types/unknown.png';
                        $this->files[] = [
                            'inode'   => $inode,
                            'name'    => $name,
                            'dir'     => false,
                            'size'    => (int)$size,
                            'dims'    => '',
                            'date'    => $lastmod,
                            'lastmod' => date('M d, Y H:i', $lastmod),
                            'icon'    => $icon,
                            'url'     => $url,
                            'path'    => str_replace('//', '/',
                                UPLOADPATH . $this->curPath . $name),
                        ];
                    }
                }
            }
        }
    }

    private function listFilesOnly()
    {
        $dir = str_replace('//', '/', UPLOADDIR . $this->path);
        $realPath = rtrim(realpath($dir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        $uploadRealPath = rtrim(realpath(UPLOADDIR), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (strstr($realPath, $uploadRealPath) === false) {
            return;
        }
        $this->curPath = substr($realPath, strlen($uploadRealPath));
        if ($this->curPath === false) {
            $this->curPath = '/';
        }
        $sorting = 0;
        if ($this->sort == 'name' && $this->dir == 'DESC') {
            $sorting = 1;
        }
        if ($d = @scandir($dir)) {
            foreach ($d as $name) {
                if (preg_match('/^\./', $name)) {
                    continue;
                }
                $lastmod = filemtime($realPath . $name);
                if (!is_dir($realPath . $name)) {
                    $size = filesize($realPath . $name);
                    $this->files[] = [
                        'text'   => $name,
                        'img'    => UPLOADPATH . $this->curPath . $name,
                        'leaf'   => true,
                        'custom' => true,
                    ];
                }
            }
        }
    }

    private function sortFiles()
    {
        switch ($this->sort) {
            case 'name':
                usort($this->files, [$this, '_sortAsString']);
                break;
            case 'size':
                usort($this->files, [$this, '_sortAsNumber']);
                break;
            case 'lastmod':
                usort($this->files, [$this, '_sortAsDate']);
                break;
        }
    }

    private function sortDirs()
    {
        switch ($this->sort) {
            case 'size':
            case 'name':
                usort($this->dirs, [$this, '_sortAsString']);
                break;
            case 'lastmod':
                usort($this->dirs, [$this, '_sortAsDate']);
                break;
        }
    }

    private function filterFiles()
    {
        $data = [];
        if ($filters = $this->getReqVar('_gridFilter', 'array')) {
            foreach ($filters as $filter) {
                switch ($filter['data']['type']) {
                    case 'numeric':
                        if ($filter['field'] == 'size') {
                            $this->search = (int)$filter['data']['value'];
                            switch ($filter['data']['comparison']) {
                                case 'lt':
                                    $data = array_filter($this->files,
                                        [$this, '_searchSizeLT']);
                                    break;
                                case 'gt':
                                    $data = array_filter($this->files,
                                        [$this, '_searchSizeGT']);
                                    break;
                                case 'eq':
                                default:
                                    $data = array_filter($this->files,
                                        [$this, '_searchSizeEQ']);
                                    break;
                            }
                            $this->files = $data;
                            if (!$this->files) {
                                return;
                            }
                        }
                        break;
                    case 'date':
                        if ($filter['field'] == 'lastmod') {
                            list($m, $d, $y) = explode("|",
                                date("m|d|Y",
                                    strtotime($filter['data']['value'])));
                            $this->search = mktime(0, 0, 0, $m, $d, $y);
                            switch ($filter['data']['comparison']) {
                                case 'lt':
                                    $files = array_filter($this->files,
                                        [$this, '_searchDateLT']);
                                    break;
                                case 'gt':
                                    $files = array_filter($this->files,
                                        [$this, '_searchDateGT']);
                                    break;
                                case 'eq':
                                default:
                                    $files = array_filter($this->files,
                                        [$this, '_searchDateEQ']);
                                    break;
                            }
                            $this->files = $files;
                            if (!$this->files) {
                                return;
                            }
                        }
                        break;
                    case 'string':
                        $this->search = $filter['data']['value'];
                        if ($filter['field'] == 'name') {
                            $data = array_filter($this->files,
                                [$this, '_searchStringName']);
                        }
                        $this->files = $data;
                        if (!$this->files) {
                            return;
                        }
                        break;
                }
            }
        }
    }

    private static function isImageFile($file)
    {
        if (preg_match('/\.(jpg|jpeg|gif|png)$/i', $file, $mm)) {
            return $mm[1];
        }
    }

    private static function isArchiveFile($file)
    {
        if (preg_match('/\.(zip|rar|tar|tgz|tar\.gz)$/i', $file, $mm)) {
            return str_replace('.', '', $mm[1]);
        }
    }

    private static function isVideoFile($file)
    {
        if (preg_match('/\.(flv|mp4|avi|mov|ogv|mkv)$/i', $file, $mm)) {
            return $mm[1];
        }
    }

    private static function isAudioFile($file)
    {
        if (preg_match('/\.(m4a|wav|mp3|aac|ogg|flac)$/i', $file, $mm)) {
            return $mm[1];
        }
    }

    // size filter methods
    private function _searchSizeLT($item)
    {
        if ($item['size'] < $this->search) {
            return $item;
        }
    }

    private function _searchSizeGT($item)
    {
        if ($item['size'] > $this->search) {
            return $item;
        }
    }

    private function _searchSizeEQ($item)
    {
        if ($item['size'] == $this->search) {
            return $item;
        }
    }

    // date filter methods
    private function _searchDateLT($item)
    {
        list($m, $d, $y) = explode("|", date("m|d|Y", $item['date']));
        $search = mktime(0, 0, 0, $m, $d, $y);
        if ($search < $this->search) {
            return $item;
        }
    }

    private function _searchDateGT($item)
    {
        list($m, $d, $y) = explode("|", date("m|d|Y", $item['date']));
        $search = mktime(0, 0, 0, $m, $d, $y);
        if ($search > $this->search) {
            return $item;
        }
    }

    private function _searchDateEQ($item)
    {
        list($m, $d, $y) = explode("|", date("m|d|Y", $item['date']));
        $search = mktime(0, 0, 0, $m, $d, $y);
        if ($search == $this->search) {
            return $item;
        }
    }

    // names filter method
    private function _searchStringName($item)
    {
        if (stripos($item['name'], $this->search) !== false) {
            return $item;
        }
    }

    // sort methods
    private function _sortAsString($item1, $item2)
    {
        $a = strtolower($item1[$this->sort]);
        $b = strtolower($item2[$this->sort]);
        if (strcasecmp($a, $b) == 0) {
            return 0;
        }
        if ($this->dir == 'ASC') {
            return strcasecmp($a, $b);
        } else {
            return -strcasecmp($a, $b);
        }
    }

    private function _sortAsNumber($item1, $item2)
    {
        $a = $item1[$this->sort];
        $b = $item2[$this->sort];
        if ($a == $b) {
            return 0;
        }
        if ($this->dir == 'ASC') {
            return ($a < $b) ? -1 : 1;
        } else {
            return ($a > $b) ? -1 : 1;
        }
    }

    private function _sortAsDate($item1, $item2)
    {
        list($m, $d, $y, $h, $i, $s) = explode("|",
            date("m|d|Y|H|i|s", strtotime($item1[$this->sort])));
        $a = mktime($h, $i, $s, $m, $d, $y);
        list($m, $d, $y, $h, $i, $s) = explode("|",
            date("m|d|Y|H|i|s", strtotime($item2[$this->sort])));
        $b = mktime($h, $i, $s, $m, $d, $y);
        if ($a == $b) {
            return 0;
        }
        if ($this->dir == 'ASC') {
            return ($a < $b) ? -1 : 1;
        } else {
            return ($a > $b) ? -1 : 1;
        }
    }

    private function _sortByNameASC($item1, $item2)
    {
        $a = strtolower($item1['name']);
        $b = strtolower($item2['name']);
        if (strcasecmp($a, $b) == 0) {
            return 0;
        }

        return strcasecmp($a, $b);
    }

    public function getCurPath()
    {
        return $this->curPath;
    }

    public function response($success = true, $message = 'OK')
    {
        $response = [
            'success' => $success,
            'message' => $message,
        ];

        echo json_encode($response);
        exit();
    }

    public function error($message)
    {
        $this->response(false, $message);
    }

    public function uploadFiles()
    {
        header('Content-Type: application/json');
        $path = $this->getReqVar("path", "text");

        if (!isset($_SERVER['HTTP_X_FILE_NAME'])) {
            $this->error('Unknown file name');
        }
        $fileName = $_SERVER['HTTP_X_FILE_NAME'];
        if (isset($_SERVER['HTTP_X_FILENAME_ENCODER']) && 'base64' == $_SERVER['HTTP_X_FILENAME_ENCODER']) {
            $fileName = base64_decode($fileName);
        }
        $fileName = htmlspecialchars($fileName);
        $fileName = self::safeTranslit($fileName);
        if (!$fileName) {
            $fileName = md5($fileName . time());
        }
        $size = intval($_SERVER['HTTP_X_FILE_SIZE']);
        $uploadDir = realpath(UPLOADDIR . $path);
        if (!preg_match('~/$~', $uploadDir)) {
            $uploadDir .= '/';
        }
        $inputStream = fopen('php://input', 'r');
        $outputFilename = $uploadDir . $fileName;
        $realSize = 0;
        $data = '';
        if ($inputStream) {
            $outputStream = fopen($outputFilename, 'w');
            while (!feof($inputStream)) {
                $bytesWritten = 0;
                $data = fread($inputStream, 1024);
                $bytesWritten = fwrite($outputStream, $data);
                if (false === $bytesWritten) {
                    $this->error('Error writing data to file');
                }
                $realSize += $bytesWritten;
            }
            fclose($outputStream);
        } else {
            $this->error('Error reading input');
        }
        if ($realSize != $size) {
            $this->error('The actual size differs from the declared size in the headers');
        }
        if ($outputFilename && preg_match('/\.(jpg|jpeg|gif|png)$/i', $outputFilename)) {
            $maxWidth = \Bump\Core\CMS::Config()->PICMAXWIDTH;
            $sz = @getimagesize($outputFilename);
            if ($maxWidth && $sz[0] > $maxWidth) {
                $phpThumb = new phpthumb();
                $phpThumb->setSourceFilename($uploadDir . $outputFilename);
                $phpThumb->setParameter('w', $maxWidth);
                $phpThumb->setParameter('bg', "FFFFFF");
                $phpThumb->setParameter('f', self::$settings['format']);
                if ($phpThumb->GenerateThumbnail()) {
                    $phpThumb->RenderToFile($uploadDir . $outputFilename);
                }
            }
        }
        $this->response();
    }
}
