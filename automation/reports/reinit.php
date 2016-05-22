<?php

include_once __DIR__ . '/../../engine/bootstrap.php';

// remove all subdirectories
$currentDir = new DirectoryIterator(__DIR__);
foreach ($currentDir as $fileinfo) {
    if ($fileinfo->isDir() && !$fileinfo->isDot()) {
        $dir = $fileinfo->getFilename();
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $fileinfo) {
            $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            $todo($fileinfo->getRealPath());
        }
        rmdir($dir);
    }
}

// re-init local cache
$auth = new Bump\Modules\Auth\Auth;
$res = $auth->auth(['login' => 'users:admin', 'password' => 'admin']);
