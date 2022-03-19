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
    }

    $dir = $SYNC_DATA_DIR.'/'.$_GET['user'];
    $key = $_GET['key'];
    $file = $dir.'/'.$key.'.json';

    $result = false;

    if (file_exists($file)) {
        $result = unlink($file);
    }

    echo '{ "result": "'.$result.'" }';


?>