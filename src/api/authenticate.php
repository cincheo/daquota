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

        if (!$authorized && isset($LDAP_SERVER)) {
            // using ldap bind
            $ldaprdn  = "uid=${_GET['user']},cn=users,${LDAP_BASE_DN}";     // ldap rdn or dn
            $ldappass = $_GET['password'];  // associated password

            // connect to ldap server
            $ldapconn = ldap_connect($LDAP_SERVER, $LDAP_SERVER_PORT);
            ldap_set_option($ldapconn, LDAP_OPT_PROTOCOL_VERSION, $LDAP_PROTOCOL_VERSION);
            ldap_set_option($ldapconn, LDAP_OPT_REFERRALS, $LDAP_REFERRALS);

            if ($ldapconn) {
                // binding to ldap server
                $ldapbind = ldap_bind($ldapconn, $ldaprdn, $ldappass);

                // verify binding
                if ($ldapbind) {
                    $search_result = ldap_search($ldapconn, $LDAP_BASE_DN, "(|(sn=${_GET['user']}*)(givenname=${_GET['user']}*))", array("ou", "sn", "givenname", "mail"));
                    $data = ldap_get_entries($ldapconn, $search_result);
                    // $data["count"] should always be one
                    $user = [];
                    $user['id'] = $data[0]['mail'][0];
                    $user['login'] = $_GET['user'];
                    $user['firstName'] = 'unset';
                    $user['lastName'] = 'unset';
                    $user['email'] = $data[0]['mail'][0];
                    $authorized = true;
                } else {
                    $error = "LDAP bind failed - " . $LDAP_SERVER . " - " . $ldapbind . " - " . $ldapconn . " - " . $ldaprdn . " - " . $ldappass;
                }
            } else {
                $error = "Could not connect to LDAP server.";
            }
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
        if (isset($error)) {
            echo '{ "authorized":false, "error":"'.$error.'" }';
        } else {
            echo '{ "authorized":false }';
        }
    }

?>