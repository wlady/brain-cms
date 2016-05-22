<?php

namespace Bump\Template\TwigExtensions;

class Form extends \Twig_Extension
{

    public function getName()
    {
        return 'form';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('formText', [$this, 'text'], ['is_safe' => ['html']]),
            new \Twig_SimpleFunction('formInput', [$this, 'input'], ['is_safe' => ['html']]),
            new \Twig_SimpleFunction('formSelect', [$this, 'select'], ['is_safe' => ['html']]),
        );
    }

    public function text($name, $attrs=[])
    {
        $field = '<textarea name="' . $name . '"';
        foreach($attrs as $key => $value) {
            if ($key == 'value') {
                continue;
            }
            $field .= ' ' . $key . '="' . $value  . '"';
        }
        $field .= '>';
        if (isset($attrs['value'])) {
            $field .= $attrs['value'];
        }
        $field .= '</textarea>';
        return $field;
    }

    public function input($name, $attrs=[])
    {
        $field = '<input name="' . $name . '"';
        if (!isset($attrs['type'])) {
            $attrs['type'] = 'text';
        }
        foreach ($attrs as $key => $value) {
            if ($key == 'checked') {
                if ($value) {
                    $field .= ' checked';
                }
                continue;
            }
            $field .= ' ' . $key . '="' . $value  . '"';
        }
        $field .= '/>';
        return $field;
    }

    public function select($name, $attrs=[])
    {
        $field = '<select name="' . $name . '"';
        foreach ($attrs as $key => $value) {
            if ($key == 'options' || $key == 'value') {
                continue;
            }
            $field .= ' ' . $key . '="' . $value . '"';
        }
        $field .= '>';
        foreach ((array)$attrs['options'] as $key => $value) {
            $field .= '<option value="' . $key . '"';
            if (isset($attrs['value']) && $attrs['value'] == $key) {
                $field .= ' selected';
            }
            $field .= '>' . $value . '</option>';
        }
        $field .= '</select>';
        return $field;
    }

}
