<?php

namespace Bump\Modules\ImageEditor;

class ImageEditor extends \Bump\Core\Module
{

    public function save()
    {
        $src = $this->getReqVar("src", "text");
        $contents = $this->getReqVar("data", "string");
        $pathInfo = pathinfo(MASTERDIR . $src);
        if (!file_exists($pathInfo['dirname'] . '/.trash')) {
            mkdir($pathInfo['dirname'] . '/.trash');
        }
        $cmd = 'mv "' . MASTERDIR . $src . '" "' . $pathInfo['dirname'] . '/.trash/backup_' . date('YmdHis') . '_' . $pathInfo['basename'] . '"';
        passthru($cmd);
        $contents_split = explode(',', $contents);
        $encoded = $contents_split[count($contents_split) - 1];
        $decoded = "";
        for ($i = 0; $i < ceil(strlen($encoded) / 256); $i++) {
            $decoded = $decoded . base64_decode(substr($encoded, $i * 256, 256));
        }
        file_put_contents(MASTERDIR . $src, $decoded);
        passthru('rm -Rf "' . PICS_CACHE_DIR . '/*"');
        return [
            'success' => true,
            'message' => ''
        ];
    }
}
