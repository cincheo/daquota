<?php

    include 'config.php';
    include 'rest_headers.php';

    $file = $SYNC_DATA_DIR.'/admin/users.json';

    $authorized = $_GET['user'] == 'admin' && $_GET['password'] == 'nur1Adlite';
    if (!$authorized) {
        $users = json_decode(json_decode(file_get_contents($file), true)['data'], true);
        $index = array_search($_GET['user'], array_column($users, 'login'));
        if ($index !== false && $users[$index]['password'] == $_GET['password']) {
            $authorized = true;
            $user = $users[$index];
            unset($user['password']);
        }
    } else {
        $user = [];
        $user['id'] = 'admin';
        $user['login'] = 'admin';
        $user['firstName'] = 'Renaud';
        $user['lastName'] = 'Pawlak';
        $user['email'] = 'renaud.pawlak@gmail.com';
    }
    if ($authorized) {
        session_start();
        $_SESSION['userId'] = $user['login'];
        echo '{ "authorized":true, "user": '.json_encode($user).', "userId": "'.$_SESSION['userId'].'", "sessionId": "'.session_id().'"}';
        session_write_close();
    } else {
        http_response_code(401);
        echo '{ "authorized":false }';
    }

?> 
