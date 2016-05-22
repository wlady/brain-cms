<?php

use Bump\Core\CMS;
use Bump\Tools\Utils;


/**
 * @Route(Contact Us Page)
 */
$app->map('/contact', $routeOptions, function () use ($app) {
    $page = $app->container->get('page');
    $form = new Bump\Modules\Forms\Forms();
    $captcha = new Bump\Modules\reCaptcha\reCaptcha();
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        header("Content-Type: application/json");
        $result = $form->parseInput(['name' => 'Contact Form']);
        if ($result['error']===true) {
            echo json_encode(['success' => false, 'message' => $result['info']]);
            exit;
        } else {
            $request = $result['vars'];
        }
        //if ($captcha->verify()) {
            if (in_array($request['Subject'], array('Feature Request', 'Bug Report', 'Inquiry', 'Just Saying Hi'))) {
                $to = CMS::Config()->CONTACTEMAIL;
            } else {
                $to = CMS::Config()->SALESEMAIL;
            }
            CMS::Config()->formData = $request;
            $emailForms = new Bump\Modules\EmailForms\EmailForms();
            $res = $emailForms->sendForm([
                'f_name' => 'Contact Form',
                'to' => [$request['EMail'] => $request['Name']],
                'from' => [$request['EMail'] => $request['Name']],
                'reply' => [$request['EMail'] => $request['Name']],
                'fields' => $request,
            ]);
            if ($res !== true) {
                echo json_encode(['success' => false, 'message' => $res['info']]);
                exit;
            }
        /*} else {
            echo json_encode(['success' => false, 'message' => 'Wrong Security Code. Try again.']);
            exit;
        }*/
        echo json_encode(['success' => true, 'message' => 'Message has been sent']);
        exit;
    }
    $vars['captcha'] = $captcha->widget();
    $page['form'] = $form->showForm(['name' => 'Contact Form', 'fields' => $vars]);
    $app->render('page.contact.twig', $page);
})->via('GET', 'POST');

/**
 * @Route(Contact Us - Thank You Page)
 */
$app->get('/contact/thanks', $routeOptions, function () use ($app) {
    $page = $app->container->get('page');
    $library = new Bump\Modules\Library\Library();
    if ($row = $library->getRow(['alias' => 'thank-you'])) {
        $page['content'] = $row['content'];
    }
    $app->render('page.default.twig', $page);
});
