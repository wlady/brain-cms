<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Tools;

use \TijsVerkoyen\Akismet\Akismet;

class AkismetFilter extends Akismet
{
    private $response;

    public function __construct($url, $name, $email, $message)
    {
        define('AKISMETAPIKEY', '2d24746b6fff');
        $akismet = new Akismet(AKISMETAPIKEY, $url);
        $this->response = $akismet->isSpam($message, $name, $email, $url, null,
            'comment');
    }

    public function isCommentSpam()
    {
        return $this->response;
    }
}
