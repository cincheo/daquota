<?php

    /*
     * d.Lite - low-code platform for local-first Web/Mobile development
     * Copyright (C) 2022 CINCHEO
     *                    https://www.cincheo.com
     *                    renaud.pawlak@cincheo.com
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU Affero General Public License as
     * published by the Free Software Foundation, either version 3 of the
     * License, or (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU Affero General Public License for more details.
     *
     * You should have received a copy of the GNU Affero General Public License
     * along with this program.  If not, see <https://www.gnu.org/licenses/>.
     */

    include 'config.php';
    include 'rest_headers.php';

    $authorized = $_GET['user'] == 'admin' && $_GET['password'] == $ADMIN_PASSWORD;
    if (!$authorized) {
        $file = $SYNC_DATA_DIR.'/admin/users.json';
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
        $user['firstName'] = $ADMIN_FIRSTNAME;
        $user['lastName'] = $ADMIN_LASTNAME;
        $user['email'] = $ADMIN_EMAIL;
        $user['canGenerateBundle'] = true;
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