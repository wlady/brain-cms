<?php

namespace Bump\Modules\reCaptcha;

use Bump\Core\CMS;

/**
 *
 * To use this module:
 *
 * 1) register your site at https://www.google.com/recaptcha/admin#list
 * 2) copy/paste your "Site Key" and "Secret Key" to "System" -> "Modules" -> "reCaptcha"
 *
 */
class reCaptcha extends \Bump\Core\Module
{

    protected static $config = null;
    protected static $settings = null;

    public function init()
    {
        if (!is_array(self::$settings)) {
            if ($data = self::getModuleSettings(get_class())) {
                self::$settings = $data;
            }
        }
        if (!is_array(self::$config)) {
            $path = __DIR__ . '/config.json';
            if (file_exists($path)) {
                self::$config = json_decode(file_get_contents($path));
            }
        }
    }

    /**
     * @codeCoverageIgnore
     */
    public function getSettings()
    {
        return self::$settings;
    }

    /**
     * @codeCoverageIgnore
     */
    public function getConfig()
    {
        return self::$config;
    }

    /**
     * To show the reCaptcha Widget in your form
     * you need to create the Widget in your router and
     * pass it to your template.
     *
     * $page = $app->container->get('page');
     * You can use the same variable in several forms.
     *
     * $page['captcha'] = (new Bump\Modules\reCaptcha\reCaptcha)->widget();
     *
     * render the template
     *
     * $app->render('test.twig', $page);
     *
     * test.twig
     *
     * <form method="POST">
     *     {{ captcha|raw }}
     * </form>
     */
    public static function widget()
    {
        $hashes = [];
        foreach (CMS::Config()->external as $resources) {
            foreach ($resources as $resource) {
                $hashes[] = md5(serialize($resource));
            }
        }
        foreach (self::$config->ExternalResources as $resource) {
            $hash = md5(serialize($resource));
            if (!in_array($hash, $hashes)) {
                CMS::Config()->external[$resource->type][] = (array)$resource;
            }
        }
        return '<div class="g-recaptcha" data-sitekey="' . self::$settings['site_key'] . '"></div>';
    }

    /**
     * Response is in g-recaptcha-response POST variable.
     * You can use this code to check that reCaptcha is valid.
     *
     *  if (isset($_POST['g-recaptcha-response'])) {
     *        if ((new Bump\Modules\reCaptcha\reCaptcha)->verify()) {
     *            //
     *        } else {
     *            //
     *        }
     *  }
     *
     * @codeCoverageIgnore
     */
    public function verify()
    {
        if ($this->getReqVar('g-recaptcha-response')) {
            $gRecaptchaResponse = $this->getReqVar('g-recaptcha-response');
        } else {
            return false;
        }
        if (isset($_SERVER['REMOTE_ADDR'])) {
            $remoteIp = $_SERVER['REMOTE_ADDR'];
        } else {
            return false;
        }
        try {
            return (new \ReCaptcha\ReCaptcha(self::$settings['secret_key']))->verify($gRecaptchaResponse, $remoteIp)->isSuccess();
        } catch (\Exception $e) {
            return false;
        }

    }
}
