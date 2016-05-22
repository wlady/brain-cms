<?php
/**
 * Contains definitions of mocked functions from global namespace.
 */

if (!function_exists('igbinary_serialize')) {
    /**
     * Mock for 'igbinary_serialize' function.
     *
     * @param $data
     * @return mixed
     */
    function igbinary_serialize($data) {
        return $data;
    }
}

if (!function_exists('igbinary_unserialize')) {
    /**
     * Mock for 'igbinary_serialize' function.
     *
     * @param $data
     * @return mixed
     */
    function igbinary_unserialize($data) {
        return $data;
    }
}
