<?php

namespace Bump\Template\TwigExtensions;

class Utils extends \Twig_Extension
{
    public function getName()
    {
        return 'utils';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('recursiveArray', [$this, 'recursiveArray'], ['is_safe' => ['html']]),
        );
    }

    public function recursiveArray($params)
    {

        if (is_array($params['array']) && count($params['array']) > 0) {
            $markup = '';

            $markup .= '<ul>';

            foreach ($params['array'] as $element) {
                $markup .= '<li id="_item_'.$element['id'].'"><a href="'.$element['url'].'"><b>'.$element['text'].'</b></a>';
                if (isset($element['children'])) {
                    $markup .= $this->recursiveArray(['array' => $element['children']]);
                }
                $markup .= '</li>';
            }

            $markup.= '</ul>';

            return $markup;

        } else {
            return '';
        }
    }
}
