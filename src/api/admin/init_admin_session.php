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
     * along with this program. If not, see <https://www.gnu.org/licenses/>.
     */

    if(!isset($_SESSION)) {
        session_start();
    }

    if (!isset($_SESSION['userId']) || $_SESSION['userId'] != $_GET['user'] || $_SESSION['userId'] != 'admin') {
        http_response_code(401);
        error_log("session error: ".'{ "authorized":false, "userId":"'.$_SESSION['userId'].'", "user":"'.$_GET['user'].'", "sessionId": "'.session_id().'" }');
        echo '{ "authorized":false, "userId":"'.$_SESSION['userId'].'", "user":"'.$_GET['user'].'", "sessionId": "'.session_id().'" }';
        die();
    }
?>