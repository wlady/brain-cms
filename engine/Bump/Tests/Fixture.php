<?php
namespace Bump\Tests;

class Fixture
{
    protected $db = null;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function load()
    {
    }

    public function remove()
    {
    }
}
