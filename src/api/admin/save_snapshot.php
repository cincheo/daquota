<?php
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