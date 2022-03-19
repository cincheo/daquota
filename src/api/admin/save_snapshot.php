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

    if (!isset($_GET['app'])) {
        echo '{ "error": "app is not provided" }';
        die();
    }

    include '../config.php';
    //include 'rest_headers.php';
    include 'init_admin_session.php';
    include 'tools.php';

    $rootTmpDir = sys_get_temp_dir();

    if (!is_dir($rootTmpDir.'/snapshots_download')) {
        mkdir($rootTmpDir.'/snapshots_download', 0777);
    }

    $zipName = $_GET['app'].'-snapshot-'.date('Y-m-d-H-i-s-u').'.zip';
    $rootPath = realpath($SYNC_DATA_DIR);

    //createZip($zipName, $rootPath);
    zipData($rootPath, $rootTmpDir.'/snapshots_download/'.$zipName);

    header('Content-Type: application/zip');
    header("Content-Disposition: attachment; filename=" . $zipName);
    header('Content-Length: ' . filesize($rootTmpDir.'/snapshots_download/'.$zipName));
    //header("Location: " . $zipName);
    readfile($rootTmpDir.'/snapshots_download/'.$zipName);
    unlink($rootTmpDir.'/snapshots_download/'.$zipName);
?>