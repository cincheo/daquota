<?php

    include '../config.php';
    //include 'rest_headers.php';
    include 'init_admin_session.php';
    include 'tools.php';

    if (!is_dir('snapshots_download')) {
        mkdir('snapshots_download', 0777);
    }

    $zipName = 'snapshots_download/' . $APP_NAME . '-snapshot-'.date('Y-m-d-H-i-s-u').'.zip';
    $rootPath = realpath($SYNC_DATA_DIR);

    createZip($zipName, $rootPath);

    header('Content-Type: application/zip');
    header("Content-Disposition: attachment; filename='" . $zipName . "'");
    header('Content-Length: ' . filesize($zipName));
    header("Location: " . $zipName);

    ?>

