<?php
/**
 * /**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\Core;

class Sanitizer
{
    public function getTypedVar($var, $type)
    {
        switch (strtolower($type)) {
            case 'html':
                // to handle values encoded in smarty templates like {$text|escape:'html'}
                return html_entity_decode($var);
            case 'text':
                return htmlspecialchars(strip_tags($var));
            case 'alpha':
                return preg_replace('~[^a-z\s]~i', '', $var);
            case 'variable':
                return preg_replace('~[^a-z0-9-_]~i', '', $var);
            case 'filename':
                return preg_replace('~[^a-z0-9-_\s\(\)\.\,\:\;\#\+]~i', '', $var);
            case 'date':
                // years range is 1900 to 2999, formats are Y-m-d, Y/m/d, m-d-Y, m/d/Y
                return (
                    preg_match('~^(1[9]|2[0-9])(\d{2})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$~', $var) ||
                    preg_match('~^(1[9]|2[0-9])(\d{2})/(0[1-9]|1[0-2])/(0[1-9]|1[0-9]|2[0-9]|3[0-1])$~', $var) ||
                    preg_match('~^(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])-(1[9]|2[0-9])(\d{2})$~', $var) ||
                    preg_match('~^(0[1-9]|1[0-2])/(0[1-9]|1[0-9]|2[0-9]|3[0-1])/(1[9]|2[0-9])(\d{2})$~', $var)
                ) ? $var : '';
            case 'time':
                // time range is 00:00:00 to 23:59:59
                return (preg_match('~^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$~', $var)) ? $var : '';
            case 'datetime':
                // datetime range is 1900-01-01 00:00:00 to 2999-01-01 23:59:59
                return (preg_match('~^((1[9]|2[0-9])\d{2})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1]) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$~',
                    $var)) ? $var : '';
            case 'int':
            case 'integer':
                return intval($var);
            case 'float':
            case 'double':
                return floatval($var);
            case 'number':
                return is_numeric($var) ? $var : '';
            case 'ccard':
                return self::luhnCheck($var) ? $var : '';
            case 'checkbox':
                return (isset($var) && ($var == 'true' || $var == 'on')) ? 'true' : 'false';
            case 'boolean':
                return (isset($var) && $var == 'true') ? true : false;
            case 'array':
                return is_array($var) ? $var : [];
            case 'json':
                return json_decode($var);
            case 'json_array':
                return json_decode($var, true);
            case 'email':
                return (filter_var($var, FILTER_VALIDATE_EMAIL) !== false) ? $var : '';
            case 'url':
                return (filter_var($var, FILTER_VALIDATE_URL) !== false) ? $var : '';
            case 'ip':
                return (filter_var($var, FILTER_VALIDATE_IP) !== false) ? $var : '';
        }

        return $var;
    }

    private static function luhnCheck($strDigits)
    {
        if ((strlen($strDigits) < 12) || (strlen($strDigits) > 19)) {
            return false;
        }
        $sum = 0;
        $alt = false;
        for ($i = strlen($strDigits) - 1; $i >= 0; $i--) {
            if ($alt) {
                $temp = $strDigits[$i];
                $temp *= 2;
                $strDigits[$i] = ($temp > 9) ? $temp = $temp - 9 : $temp;
            }
            $sum += $strDigits[$i];
            $alt = !$alt;
        }

        return $sum % 10 == 0;
    }

}
