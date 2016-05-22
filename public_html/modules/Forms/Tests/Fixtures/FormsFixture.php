<?php
namespace Bump\Modules\Forms\Tests\Fixtures;

class FormsFixture extends \Bump\Tests\Fixture
{
    public function load()
    {
        $testData = [
            [
                'PHPUnit Test Form',
                '<form action="/test" id="test" method="post" name="test">
                    <div>
                        <ul class="form">
                            <li> <label for="Name"><span class="red">*</span> Name:</label>
                                {{ formInput("Name", {required: "required", id: "Name", value: request.Name}) }}
                            </li>
                            <li> <label for="EMail"><span class="red">*</span> Email:</label>
                                <input id="EMail" name="EMail" type="text" value="{{request.EMail}}" required="required" xtype="email">
                            </li>
                            <li> <label for="Phone"> Phone Number:</label>
                                <input id="Phone" name="Phone" type="text" value="{{request.Phone}}">
                            </li>
                            <li> <label for="Agree"><span class="red">*</span> I Agree to receive Notifications:</label>
                                <input id="Agree" name="Agree" type="checkbox" value="{{request.Agree}}" required="required">
                            </li>
                            <li> <label for="Method"> Notification Method:</label>
                                {{ formSelect("Method", {options: request.Methods, required: "required", id: "Method",  value: request.Method}) }}
                            </li>
                            <li> <label for="Types"> Notification Types:</label>
                                <input id="warnings" name="warnings" type="radio" value="warning"> Warnings
                                <input id="errors" name="errors" type="radio" value="warning"> Errors
                            </li>
                            <li> <label for="Message"><span class="red">*</span> Message:</label>
                                {{ formText("Message", {required: "required", id: "Message", value: request.Message}) }}
                            </li>
                            <li> <label for="Comments"><span class="red">*</span> Security Code:</label>
                                <input id="code" name="code" style="width: 100px;margin-right:5px;" type="text" required="required">{{request.captcha|raw}}
                            </li>
                            <li> <label for="submit"></label>
                                <div class="btn_blue contact_btn"><a href="javascript:SendContactForm()">Send</a></div>
                            </li>
                </ul></form>',
                'true',
            ],
        ];
        $sql = 'INSERT INTO `cms_forms` (`name`, `content`, `active`) VALUES (?,?,?)';
        foreach ($testData as $tdata){
            try{
                $this->db->Execute($sql, $tdata);
            } catch (\Exception $e) {
                print($e->getMessage());
            }
        }
    }

    public function remove()
    {
        $sql = 'DELETE FROM cms_forms WHERE name=?';
        try {
            $this->db->Execute($sql, 'PHPUnit Test Form');
        } catch (\Exception $e) {
            print($e->getMessage());
        }
    }
}
