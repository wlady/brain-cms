<?php

namespace Bump\Modules\Pictures;

use \Bump\Core\CMS;
use Bump\Modules\Albums\Albums;

class YoutubeDataLoader
{
    private $id = null;
    private $item = null;
    private $result = null;
    private $success = false;
    private static $videoUrl = 'https://www.googleapis.com/youtube/v3/videos?id=:video_id&key=:api_key&part=snippet,contentDetails,status,player';
    const CATEGORIES_URL = 'https://www.googleapis.com/youtube/v3/videoCategories?id=:video_id&key=:api_key&part=snippet';

    public function __construct($video_id, $item_id)
    {
        $this->id = $video_id;
        $this->item = $item_id;
        if ($this->load() !== false) {
            $this->success = true;
        }
    }

    public function isSuccess()
    {
        return $this->success;
    }

    public function getResult()
    {
        return $this->result;
    }

    public function getHtml()
    {
        if (!$this->isSuccess()) {
            return;
        }
        $template = CMS::Config()->template;
        $template->forceTplDir(__DIR__ . '/ux/tpl/');
        $template->setTpl('result', $this->result);
        $buf = $template->toString();
        return $buf;
    }

    private function load()
    {
        $data = $this->getJsonData(self::$videoUrl);

        if (empty($data)) {
            return false;
        }

        $item = reset($data->items);
        $result = [
            'id' => $this->id,
            'item' => $this->item,
            'published' => $item->publishedAt,
            'categories' => [],
            'duration' => $item->contentDetails->duration,
            'title' => $item->snippet->title,
            'content' => $item->snippet->description,
            'author' => null
        ];

        $result['success'] = true;
        return $this->result = $result;
    }

    public function __get($name)
    {
        if ($this->result && array_key_exists(strtolower($name), $this->result)) {
            return $this->result[$name];
        }
        return false;
    }

    protected function getJsonData($url)
    {
        $settings = (new Albums())->getSettings();
        $url = strtr($url, [':video_id' => $this->id, ':api_key'=> $settings['youtube']]);

        $content = file_get_contents($url);
        $data = json_decode($content);

        if (empty($content) || json_last_error() != JSON_ERROR_NONE || empty($data->items)) {
            return false;
        }

        return $data;
    }
}
