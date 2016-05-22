<?php

namespace Bump\Modules\EmailAttachments;

class EmailAttachments extends \Bump\Core\Module
{

    public function init()
    {
        $this->model = new Model\EmailAttachment();
    }

    /**
     * @codeCoverageIgnore
     */
    protected function _postDelRow()
    {
        $this->clearCache();
    }

    public function addFile()
    {
        $docsLibrary = UPLOADDIR;
        $response = ["success" => true];
        $folder = $this->getReqVar("folder", "text");
        $form = $this->getReqVar("form_id", "int");
        $names = $this->getReqVar("names", "json");
        $path = str_replace('//', '/', $docsLibrary . $folder . '/');
        $sql = "INSERT INTO cms_email_attachments SET form_id=?, a_path=?, a_filename=?, a_size=?";
        foreach ($names as $name) {
            if (file_exists($path . $name)) {
                $size = filesize($path . $name);
                try {
                    $this->db->Execute($sql, [$form, UPLOADPATH . $folder, $name, $size]);
                } catch (\Exception $e) {
                    throw new \Exception($e->getMessage());
                }
            }
        }
        $this->clearCache();
        return $response;
    }

    public function getFiles()
    {
        $args = func_get_arg(0);
        return $this->getRows($args);
    }
}
