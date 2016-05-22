<?php

namespace Bump\Modules\OEmbed;

use Bump\Core\CMS;

class OEmbed extends \Bump\Core\Module
{
    protected static $settings = [];

    function init()
    {
        if ($data = self::getModuleSettings(get_class())) {
            self::$settings = $data;
        }
    }

    public function getInfo()
    {
        $config = CMS::Config();
        $path = $this->getReqVar('path', 'text');
        $data = [];
        if (self::$settings['cache'] == 'true') {
            if (!($data = $config->cache->get($path))) {
                $info = \Embed\Embed::create($path);
                $data = [
                    'title' => $info->title,
                    'html' => $info->code,
                    'type' => $info->type,
                    'width' => $info->width,
                    'height' => $info->height
                ];
                $config->cache->set($path, $data);
            }
        } else {
            $info = \Embed\Embed::create($path);
            $data = [
                'title' => $info->title,
                'html' => $info->code,
                'type' => $info->type,
                'width' => $info->width,
                'height' => $info->height
            ];
        }
        if (!$data['html']) {
            return [
                'success' => false
            ];
        } else {
            return [
                'success' => true,
                'data' => $data
            ];
        }
    }
}
