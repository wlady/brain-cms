<?php
/**
 *
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 */
namespace Bump\AdoDB;

class AdoDB
{
    use \Bump\Traits\Singleton;

    private static $db = null;

    protected function init()
    {
        if (self::$db) {
            return self::$db;
        }
        $dsn = sprintf("%s://%s:%s@%s/%s", DB_PLATFORM, DB_USER, DB_PASSWORD, DB_SERVER, DB_SCHEMA);
        if (defined('DB_PORT') && DB_PORT) {
            $dsn .= '?port=' . DB_PORT;
        }
        try {
            self::$db = NewADOConnection($dsn);
            self::$db->SetCharSet('utf8');
            self::$db->SetFetchMode(ADODB_FETCH_ASSOC);
            \ADODB_Active_Record::SetDatabaseAdapter(self::$db);
        } catch (Exception $e) {
            error_log($e, 3, LOGFILE);
            die();
        }
        if (defined('DEBUG') && DEBUG) {
            self::$db->debug = true;
        }
        $sql = 'SET time_zone = ?';
        self::$db->Execute($sql, TZ_OFFSET);
        return self::$db;
    }
}
