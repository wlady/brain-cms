<?php

if (count(\Bump\Core\CMS::Config()->cdns)) {
    function postProcess($content, $type)
    {
        if ($type === Minify::TYPE_CSS) {
            return \Bump\Tools\Utils::rewriteCssUrls($content);
        }

        return $content;
    }
    $min_serveOptions['rewriteCssUris'] = true;
    $min_serveOptions['postprocessor'] = 'postProcess';
}
