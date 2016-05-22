<?php
/**
 * This file is part of BCMS 6 by wlady@od.bumpnetworks.com
 *
 * Package Bump
 *
 */
namespace Bump\Traits;

trait AdoDB
{
    /**
     * @var \ADOConnection
     */
    public $db = null;

    public function connect()
    {
        $dsn = sprintf("%s://%s:%s@%s/%s", DB_PLATFORM, DB_USER, DB_PASSWORD, DB_SERVER, DB_SCHEMA);
        if (defined('DB_PORT') && DB_PORT) {
            $dsn .= '?port=' . DB_PORT;
        }
        try {
            $this->db = NewADOConnection($dsn);
            $this->db->SetCharSet('utf8');
            $this->db->SetFetchMode(ADODB_FETCH_ASSOC);
            \ADODB_Active_Record::SetDatabaseAdapter($this->db);
        } catch (Exception $e) {
            error_log($e, 3, LOGFILE);
            die();
        }
        if (defined('DEBUG') && DEBUG) {
            $this->db->debug = true;
        }
        $sql = 'SET time_zone = ?';
        $this->db->Execute($sql, TZ_OFFSET);
    }
}
