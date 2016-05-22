<?php

$albums = new \Bump\Modules\Albums\Albums();
$data = $albums->getSettings();
$app->setTpl('enableDND', $data['dnd']);
