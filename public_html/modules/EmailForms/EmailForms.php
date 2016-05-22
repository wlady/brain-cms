<?php

namespace Bump\Modules\EmailForms;

use Bump\Core\CMS;

class EmailForms extends \Bump\Core\Module
{
    protected static $settings = [];

    public function init()
    {
        $this->model = new Model\EmailForm();
        if ($data = self::getModuleSettings(get_class())) {
            self::$settings = $data;
        }
    }

    /**
     * @AccessLevel(0)
     */
    function sendForm()
    {
        $args = func_get_arg(0);
        $data = $this->getReqVar('fields', 'array', $args);
        if (is_array($data)) {
            $request = array_merge($args, $data);
        } else {
            $request = $args;
        }
        $request['DOMAIN'] = CMS::Config()->DOMAIN;
        $form = $this->getRow([
            'f_name' => $request['f_name']
        ]);
        if ($this->isAjax() && !$form['success']) {
            return false;
        }
        if ($form) {
            $tpl = CMS::Config()->template;
            if (array_key_exists('rows', $form)) {
                $form = $form['rows'][0];
            } else {
                if (array_key_exists('data', $form)) {
                    $form = $form['data'];
                }
            }
            $to = isset($request['to']) ? $request['to'] : ($form['f_to'] ? $form['f_to'] : CMS::Config()->MAILROOT);
            $reply = isset($request['reply']) ? $request['reply'] : CMS::Config()->MAILROOT;
            $from = isset($request['from']) ? $request['from'] : (CMS::Config()->SITESENDEREMAIL ? CMS::Config()->SITESENDEREMAIL : CMS::Config()->MAILROOT);
            $tpl->setTpl('email', $request);
            $body = $tpl->toString("string:{$form['f_template']}");
            if (isset($request['subject'])) {
                $subject = $request['subject'];
            } else {
                $subject = $tpl->toString("string:{$form['f_subject']}");
            }
            if (!empty(self::$settings['server']) && !empty(self::$settings['port'])) {
                // @codeCoverageIgnoreStart
                $transport = Swift_SmtpTransport::newInstance(self::$settings['server'],
                    self::$settings['port'],
                    ((boolean)self::$settings['ssl'] ? 'ssl' : ''));
                if (!empty(self::$settings['user']) && !empty(self::$settings['password'])) {
                    $transport->setUsername(self::$settings['user'])->setPassword(self::$settings['password']);
                }
            } else {// @codeCoverageIgnoreEnd
                $transport = \Swift_SendmailTransport::newInstance();
            }
            $mailer = \Swift_Mailer::newInstance($transport);
            $message = \Swift_Message::newInstance()
                ->setSubject($subject)
                ->setFrom($from)
                ->setTo($to)
                ->setReplyTo($reply)
                ->addPart($body, 'text/html');
            if ($form['f_cc']) {
                $message->setCc($form['f_cc']);
            }
            if ($request['attachments'] && count($request['attachments'])) {
                // check dynamic attachments
                foreach ($request['attachments'] as $attachment) {
                    if (isset($attachment['type'])) {
                        $mime = isset($attachment['mime']) ? $attachment['mime'] : 'application/octet-stream';
                        switch ($attachment['type']) {
                            case 'data':
                                $name = isset($attachment['name']) ? $attachment['name'] : 'attachment';
                                if (isset($attachment['data'])) {
                                    $res = \Swift_Attachment::newInstance($attachment['data'], $name, $mime);
                                    $message->attach($res);
                                }
                                break;
                            case 'file':
                            default:
                                if (isset($attachment['path']) && file_exists($attachment['path'])) {
                                    $name = isset($attachment['name']) ? $attachment['name'] : basename($attachment['path']);
                                    $res = \Swift_Attachment::newInstance(file_get_contents($attachment['path']), $name, $mime);
                                    $message->attach($res);
                                }
                                break;
                        }
                    }
                }
            } else {
                // check static files
                $sql = "SELECT * FROM cms_email_attachments WHERE form_id=?";
                if ($attachments = $this->db->CacheGetAll(MAX_CACHE_TIME, $sql,
                    $form['f_id'])
                ) {
                    foreach ($attachments as $attachment) {
                        $file = \Swift_Attachment::fromPath(CMS::Config()->DOMAIN . $attachment['a_path'] . '/' . $attachment['a_filename']);
                        $message->attach($file);
                    }
                }
            }
            $mailer->send($message);
            // save log
            if ($form['f_logging'] == 'true') {
                if (is_array($from)) {
                    $v = array_values($from);
                    $k = array_keys($from);
                    $from = '"' . trim($v[0]) . '" <' . $k[0] . '>';
                }
                if (is_array($to)) {
                    $v = array_values($to);
                    $k = array_keys($to);
                    $to = '"' . trim($v[0]) . '" <' . $k[0] . '>';
                }
                $data = [
                    $form['f_id'],
                    $subject,
                    $from,
                    $to,
                    str_replace(["$", "?"], ["&#036;", "&#063"], $body),
                    serialize($request)
                ];
                $sql = "INSERT INTO cms_email_logs (form_id,fl_date,fl_subject,fl_address_from,fl_address_to,fl_message,fl_post) VALUES (?,NOW(),?,?,?,?,?)";
                $this->db->Execute($sql, $data);
            }
            // send reply
            if (isset($request['reply']) && trim($form['f_reply_content'])) {
                if (!empty($form['f_reply_subject'])) {
                    $subject = $tpl->toString("string:{$form['f_reply_subject']}");
                } else {
                    $subject = "Auto Reply from " . CMS::Config()->SITENAME;
                }
                $tpl->setTpl('email', $request);
                $body = $tpl->toString("string:{$form['f_reply_content']}");
                $message = \Swift_Message::newInstance()
                    ->setSubject($subject)
                    ->setFrom(CMS::Config()->MAILROOT)
                    ->setTo($reply)
                    ->addPart($body, 'text/html');
                $mailer->send($message);
            }
            // @codeCoverageIgnoreStart
            if (isset($request['onsuccess'])) {
                header("Location: " . $request['onsuccess']);
                exit;
            }
            // @codeCoverageIgnoreEnd
        } else {
            return false;
        }
        return true;
    }

    /**
     * @JSDataStore(id:=emailforms)
     * @JSDataStore(id:=emailforms2 empty:=1)
     */
    public function getFormsArray()
    {
        $args = func_get_arg(0);
        if ($this->getReqVar('empty', 'int', $args)) {
            $res = [[0, CMS::Labels()->not_selected]];
        } else {
            $res = [];
        }
        $sql = "SELECT f_id, f_name FROM cms_email_forms WHERE f_active='true' ORDER BY f_name";
        if ($rows = $this->db->GetAll($sql)) {
            foreach ($rows as $row) {
                $res[] = [$row['f_id'], $row['f_name']];
            }
        }
        return $res;
    }
}
