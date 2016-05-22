<?php

require_once __DIR__."/../../bootstrap.php";

$state = [];
$session = \Bump\Core\CMS::session();
if (!$session->isItem('state')) {
	$state['state'] = ['sessionId'=>session_id()];
}
foreach ($_COOKIE as $name=>$value) {
	// look for state cookies
	if (strpos($name, 'ys-') === 0) {
		// store in session
		$state['state'][substr($name, 3)] = urlencode($value);
		// remove cookie
		setCookie($name, '', time()-10000, '/');
	}
}
$session->setItem('state', $state);
header("Content-Type: text/javascript");
