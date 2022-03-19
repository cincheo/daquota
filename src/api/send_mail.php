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

