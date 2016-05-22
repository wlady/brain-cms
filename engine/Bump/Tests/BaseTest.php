<?php
namespace Bump\Tests;

class BaseTest extends \PHPUnit_Framework_TestCase
{
    protected static $dbh;
    protected static $fixtures = null;

    public static function setUpBeforeClass()
    {
        self::$dbh = (new \Bump\AdoDB\Recordset())->db;
        if (!empty(static::$fixtures)) {
            self::loadFixtures(static::$fixtures);
        }
    }

    public static function tearDownAfterClass()
    {
        if (!empty(static::$fixtures)) {
            self::removeFixtures(static::$fixtures);
        }
        self::$dbh = null;
    }

    /**
     * get protected/private method
     */
    public function getMethod($name)
    {
        $class = new \ReflectionClass(get_class($this->object));
        $method = $class->getMethod($name);
        $method->setAccessible(true);
        return $method;
    }

    /**
     * protected/private getProperty
     */
    public function getProperty($property)
    {
        $class = new \ReflectionClass(get_class($this->object));
        $property = $class->getProperty($property);
        $property->setAccessible(true);
        return $property->getValue($this->object);
    }

    /**
     * protected/private setProperty
     */
    public function setProperty($property, $value)
    {
        $class = new \ReflectionClass(get_class($this->object));
        $property = $class->getProperty($property);
        $property->setAccessible(true);
        return $property->setValue($this->object, $value);
    }


    /**
     * Invokes method of $this->object with arguments passed.
     * Can be used to invoke of protected or private methods.
     *
     * @param string $method Method name.
     * @param array $args An array of arugments which will be injected into the method.
     * @return mixed Response from called method.
     */
    public function invokeMethod($method, array $args = array())
    {
        $method = $this->getMethod($method);

        return $method->invokeArgs($this->object, $args);
    }

    /**
     *
     * @param array $fixtures
     */
    public static function loadFixtures(array $fixtures)
    {
        foreach ($fixtures as $fixture) {
            /**
             * @var \Bump\Tests\Fixture $fixtureCl
             */
            $fixtureCl = new $fixture(self::$dbh);
            $fixtureCl->load();
        }
    }

    /**
     *
     * @param array $fixtures
     */
    public static function removeFixtures(array $fixtures)
    {
        foreach ($fixtures as $fixture) {
            /**
             * @var \Bump\Tests\Fixture $fixtureCl
             */
            $fixtureCl = new $fixture(self::$dbh);
            $fixtureCl->remove();
        }
    }

    /**
     * Mock ADO Connection object to throw an Exception.
     * Can be used to test classes extended from Bump\Core\Module
     * Note: original 'db' property of current object is overridden.
     *       Use this method at the end of your tests!
     *
     * @param string $method  Name of native ADODb method
     */
    public function expectedADOExceptionIn($method)
    {
        $mock = $this->getMockBuilder('ADOConnection')
            ->getMock();
        $mock->expects($this->any())
            ->method($method)
            ->will($this->throwException(new \Exception()));
        $this->setProperty('db', $mock);
        $this->setExpectedException('\Exception');
    }
}
