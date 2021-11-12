<?php

    include 'config.php';
    include 'rest_headers.php';

    if (!isset($_GET['user'])) {
        echo '{ "error": "user is not provided" }';
    }
    if (!isset($_GET['target_user'])) {
        echo '{ "error": "target user is not provided" }';
    }
    if (!isset($_GET['subject'])) {
        echo '{ "error": "subject is not provided" }';
    }
    if (!isset($_GET['message'])) {
        echo '{ "error": "message is not provided" }';
    }

    $result = mail(
                  $_GET['target_user'],
                  $_GET['subject'],
                  $_GET['message']
              );

    echo '{ "result": "'.$result.'" }';

?> 

