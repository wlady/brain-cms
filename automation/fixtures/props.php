<?php

$projectDir = realpath(__DIR__ . '/../..');
require $projectDir . '/vendor/autoload.php';

$propertiesFile = __DIR__ . '/.properties';

if (file_exists($projectDir . '/config.local.json')) {
    $config = json_decode(file_get_contents($projectDir . '/config.local.json'), true);
} elseif (file_exists($projectDir . '/config.json')) {
    $config = json_decode(file_get_contents($projectDir . '/config.json'), true);
} else {
    echo "Create config.json or config.local.json first!\n";
    die;
}

$dbConfig = '';

if (isset($config['DB'])) {
    foreach ($config['DB'] as $key => $value) {
        if (strtolower($key)!=='password') {
            $dbConfig .= sprintf("db.%s=%s\n", strtolower($key), trim($value));
        }
    }
}

file_put_contents($propertiesFile, $dbConfig);



