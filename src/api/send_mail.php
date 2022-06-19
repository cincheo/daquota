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
    include 'init_session.php';

    function checkUserValidity($user) {
        $file = $SYNC_DATA_DIR.'/admin/users.json';
        $users = json_decode(json_decode(file_get_contents($file), true)['data'], true);
        $index = array_search($_GET['target_user'], array_column($users, 'login'));
        if ($index !== false) {
            return true;
        } else {
            $result = false;
            if (isset($LDAP_SERVER)) {
                // using ldap bind
                $ldaprdn  = "uid=${LDAP_ADMIN_UID},cn=users,${LDAP_BASE_DN}";     // ldap rdn or dn
                $ldappass = $LDAP_ADMIN_PASSWORD;  // associated password

                // connect to ldap server
                $ldapconn = ldap_connect($LDAP_SERVER, $LDAP_SERVER_PORT);
                ldap_set_option($ldapconn, LDAP_OPT_PROTOCOL_VERSION, $LDAP_PROTOCOL_VERSION);
                ldap_set_option($ldapconn, LDAP_OPT_REFERRALS, $LDAP_REFERRALS);

                if ($ldapconn) {
                    // binding to ldap server
                    $ldapbind = ldap_bind($ldapconn, $ldaprdn, $ldappass);

                    // verify binding
                    if ($ldapbind) {
                        $search_result = ldap_search($ldapconn, $LDAP_BASE_DN, "(|(sn=${_GET['target_user']}*)(givenname=${_GET['target_user']}*))", array("ou", "sn", "givenname", "mail"));
                        $data = ldap_get_entries($ldapconn, $search_result);

                        if ($data["count"] > 0) {
                            $result = true;
                        }
                    } else {
                        $error = "LDAP bind failed - " . $LDAP_SERVER . " - " . $ldapbind . " - " . $ldapconn . " - " . $ldaprdn . " - " . $ldappass;
                    }
                } else {
                    $error = "Could not connect to LDAP server.";
                }
            }
            return $result;
        }
    }

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

    if (checkUserValidity($_GET['target_user']) == false) {

        $message = file_get_contents("php://input");

        $headers = 'From: '.$_GET['user']."\r\n" ;
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

    } else {
        echo '{ "error": "cannot send mail to non-registered user (' . $_GET['target_user'] . ')" }';
    }


?> 

