<?php

    include 'config.php';
    include 'rest_headers.php';

    $file = $SYNC_DATA_DIR.'/'.'.users.json';

    $users = json_decode(file_get_contents($file), true);

    if (array_key_exists($_GET['user'], $users) && $users[$_GET['user']]['password'] == $_GET['password']) {
        $user = $users[$_GET['user']];
        unset($user['password']);
        $user['login'] = $_GET['user'];
        echo '{ "authorized":true, "user": '.json_encode($user).'}';
    } else {
        http_response_code(401);
        echo '{ "authorized":false }';
    }

?> 
