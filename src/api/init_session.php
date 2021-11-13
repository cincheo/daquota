
<?php

    if(!isset($_SESSION)) {
        session_start();
    }

    if (!isset($_SESSION['userId']) || $_SESSION['userId'] != $_GET['user']) {
        http_response_code(401);
        echo '{ "authorized":false, "userId":"'.$_SESSION['userId'].'", "user":"'.$_GET['user'].'", "sessionId": "'.session_id().'" }';
        die();
    }
?>
