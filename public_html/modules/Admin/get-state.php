<?php

require_once __DIR__."/../../bootstrap.php";

$session = \Bump\Core\CMS::Session();
if(!$session->isItem('state')) {
	$session->setItem('state', ['sessionId'=>session_id()]);
}
header("Content-Type: text/javascript");
echo sprintf('Ext.appState = %s;', json_encode($session->getItem('state')));
