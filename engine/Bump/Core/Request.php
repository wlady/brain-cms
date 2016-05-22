<?php
/**
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class Request extends Sanitizer
{
    use \Bump\Traits\Singleton;

    public function isAjax()
    {
        return ((!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest'));
    }

    public function getReqVar($var, $type = '', $input = null)
    {
        if (!$input) {
            $input = CMS::Config()->request;
        }
        if (isset($input[$var])) {
            return $this->getTypedVar($input[$var], $type);
        }
    }

    public function sanitizeReqVars($args, &$output)
    {
        if (is_array($args)) {
            foreach ($args as $name => $type) {
                if (array_key_exists($name, $_REQUEST)) {
                    $output[$name] = $this->getReqVar($name, $type);
                }
            }
        }
    }

    /**
     * @codeCoverageIgnore
     */
    public function checkCORS($listOfOrigins = [])
    {
        if (!count($listOfOrigins)) {
            $listOfOrigins = \Bump\Core\CMS::config()->origins;
        }
        if (!array_key_exists('HTTP_ORIGIN', $_SERVER)
            && array_key_exists('HTTP_X_REQUESTED_WITH', $_SERVER)
            && 'xmlhttprequest' === strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) // AJAX-only
            && array_key_exists('HTTP_REFERER', $_SERVER)
            && false !== ($uri = parse_url($_SERVER['HTTP_REFERER']))
            && isset($uri['host'])
        ) { // simplest format check
            $scheme = isset($uri['scheme']) ? $uri['scheme'] : 'http';
            $_SERVER['HTTP_ORIGIN'] = $scheme . '://' . $uri['host'];
        }
        if (is_array($listOfOrigins) && array_key_exists('HTTP_ORIGIN', $_SERVER)) {
            if (!in_array($_SERVER['HTTP_ORIGIN'], $listOfOrigins, true)) {
                @header('HTTP/1.1 400 Bad Request');
                exit;
            }
            @header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
            if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
                @header('Access-Control-Max-Age: 604800'); // 1 week is ok
                if (array_key_exists('HTTP_ACCESS_CONTROL_REQUEST_HEADERS', $_SERVER)) {
                    $headers = array_unique(explode(',', $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']));
                    foreach ($headers as $header) {
                        @header('Access-Control-Allow-Headers: ' . $header, false);
                    }
                }
                exit;
            }
        }
    }
}
