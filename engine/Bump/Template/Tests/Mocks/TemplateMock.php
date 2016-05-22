<?php

namespace Bump\Template\Tests\Mocks;

use Bump\Template\Template;

class TemplateMock extends Template
{
    protected function setTplValue( $name, $value, $overwrite = true)
    {
        $this->tpls[$name] = $value;
    }

    protected function getTplsValue()
    {
        return $this->tpls;
    }
}
