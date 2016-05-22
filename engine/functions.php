<?php

function generateWilds($item)
{
    $agent = $_SERVER['HTTP_USER_AGENT'];
    if (preg_match('/Linux/',$agent)) {
        $os = 'Linux';
    } elseif (preg_match('/Win/',$agent)) {
        $os = 'Windows';
    } elseif (preg_match('/Mac/',$agent)) {
        $os = 'Mac';
    }
    if ($os=='Windows') {
        return '*.'.strtolower($item);
    } else {
        return '*.'.strtolower($item).';*.'.strtoupper($item);
    }
}

function ellipsis($text, $max=100, $append='&hellip;')
{
    if (strlen($text) <= $max) {
        return $text;
    }
    $out = substr($text,0,$max);
    if (strpos($text,' ') === false) {
        return $out.$append;
    }
    return preg_replace('/\w+$/','',$out).$append;
}

function getNonCommentedLine($item)
{
    $item = trim($item);
    if (substr($item, 0, 1)!='#' && substr($item, 0, 2)!='//') {
        return $item;
    }
}

function array_insert(&$array, $insert, $position)
{
    array_splice($array, $position, 0, $insert);
}

function _var_dump($var)
{
    ob_start();
    print_r($var);
    $v = ob_get_contents();
    ob_end_clean();
    return $v.PHP_EOL;
}

function flog( $var )
{
    file_put_contents(FLOG, '+---+ '.date( 'H:i:s d-m-Y' ).' +-----+'.PHP_EOL._var_dump($var).PHP_EOL, FILE_APPEND);
}
