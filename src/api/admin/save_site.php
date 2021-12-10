<?php

    include '../config.php';
    //include 'rest_headers.php';
    include 'init_admin_session.php';
    include 'tools.php';

    if (!is_dir('sites_download')) {
        mkdir('sites_download', 0777);
    }

    $zipName = 'sites_download/' . $APP_NAME . '-site-'.date('Y-m-d-H-i-s-u').'.zip';
    $rootPath = realpath('../..');

    createZip($zipName, $rootPath);

    header('Content-Type: application/zip');
    header("Content-Disposition: attachment; filename='" . $zipName . "'");
    header('Content-Length: ' . filesize($zipName));
    header("Location: " . $zipName);

    ?>

