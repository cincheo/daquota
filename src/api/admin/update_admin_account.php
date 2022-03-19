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

    include '../config.php';
    include '../rest_headers.php';
    include 'init_admin_session.php';

    $body = file_get_contents("php://input");

    $account = json_decode($body, true);

    if ($account['oldPassword'] != $ADMIN_PASSWORD || !isset($account['newPassword'])) {
        echo '{ "error": "Invalid password" }';
    } else {
        $config = "<?php\n";
        $config .= "    \$SYNC_DATA_DIR = '".$SYNC_DATA_DIR."';\n";
        $config .= "    \$ADMIN_PASSWORD = '".$account['newPassword']."';\n";
        $config .= "    \$ADMIN_FIRSTNAME = '".$account['firstName']."';\n";
        $config .= "    \$ADMIN_LASTNAME = '".$account['lastName']."';\n";
        $config .= "    \$ADMIN_EMAIL = '".$account['email']."';\n";
        $config .= "?>";
        file_put_contents('../config.php', $config);
        echo '{ "result": "Account successfully updated" }';
    }
?>