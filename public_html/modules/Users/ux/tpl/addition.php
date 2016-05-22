<?php

use Bump\Core\CMS;

$providersData = [];
foreach (CMS::Config()->authProviders->providers as $provider) {
    $providerClassName = '\\Bump\\Auth\\' . $provider;
    if (class_exists($providerClassName)) {
        $providersData[] = [
            'type' => $provider,
            'title' => $provider
        ];
    }
}
$app->setTpl('providersData', $providersData);

$data = (new \Bump\Modules\Modules\Modules())->getModule('UsersWhitelist');
if (isset($data['m_levels']) && $data['m_levels'] && in_array(CMS::User()->getUserLevel(), explode(',', $data['m_levels']))) {
    $app->setTpl('whitelist', 'true');
} else {
    $app->setTpl('whitelist', 'false');
}
