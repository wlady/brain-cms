<?php

$formFields = new \Bump\Modules\FormFields\FormFields();
$data = $formFields->getTypesLabels();
unset($formFields);
$app->setTpl('data', json_encode($data));
