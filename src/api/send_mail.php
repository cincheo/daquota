<?php

    include 'config.php';
    include 'rest_headers.php';
    include 'init_session.php';

    if (!isset($_GET['user'])) {
        echo '{ "error": "user is not provided" }';
        die();
    }
    if (!isset($_GET['target_user'])) {
        echo '{ "error": "target user is not provided" }';
        die();
    }
    if (!isset($_GET['subject'])) {
        echo '{ "error": "subject is not provided" }';
        die();
    }

    $message = file_get_contents("php://input");

    $headers = 'From: '.$_GET['user']."\r\n" ;
    $headers .='Reply-To: '.$_GET['user']."\r\n" ;
    $headers .='X-Mailer: PHP/'.phpversion();
    $headers .="MIME-Version: 1.0\r\n";
    $headers .="Content-type: text/html; charset=UTF-8\r\n";

    $result = mail(
                  $_GET['target_user'],
                  $_GET['subject'],
                  $message,
                  $headers
              );

    echo '{ "result": "'.$result.'" }';

?> 

