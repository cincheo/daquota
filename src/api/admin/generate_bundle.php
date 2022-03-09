<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    include '../config.php';
    //include '../rest_headers.php';
    //include 'init_admin_session.php';
    include 'tools.php';

    if (!isset($_GET['user'])) {
        echo '{ "error": "user is not provided" }';
        die();
    }

    if (!isset($_GET['adminPassword']) && isset($_GET['dataDirectory'])) {
        echo '{ "error": "admin password is not provided" }';
        die();
    }

    if (!isset($_GET['dataDirectory']) && isset($_GET['adminPassword'])) {
        echo '{ "error": "data dir is not provided" }';
        die();
    }

    $body = file_get_contents('php://input');
    $applicationModel = json_decode($body, true);
    $output = ''; //$body;
    $applicationName = $applicationModel['applicationModel']['name'];
    $timestamp = date('Y-m-d-H-i-s-u');

    $rootTmpDir = sys_get_temp_dir();

    $tmpDir = 'tmp-bundle-'.$_GET['user'].'-'.$applicationName.'-'.$timestamp;
    mkdir($rootTmpDir.'/'.$tmpDir, 0777);
    $applicationFile = $tmpDir.'/'.$applicationName.'.dlite';

    file_put_contents($rootTmpDir.'/'.$applicationFile, file_get_contents('php://input'));
    $currentDir = getcwd();
    chdir('../../..');
    $bundleScript = realpath('.').'/bundle.sh';

    $output .= `pwd`.' : ';
    $output .= '"'.$bundleScript.'" "'.$rootTmpDir.'/'.$applicationFile.'" "'.$rootTmpDir.'/'.$tmpDir.'" : ';

    $output .= "***************";

    if (isset($_GET['adminPassword'])) {
        $result = shell_exec('"'.$bundleScript.'" "'.$rootTmpDir.'/'.$applicationFile.'" "'.$rootTmpDir.'/'.$tmpDir.'" "'.$_GET['adminPassword'].'" "'.$_GET['dataDirectory'].'"');
    } else {
        $result = shell_exec('"'.$bundleScript.'" "'.$rootTmpDir.'/'.$applicationFile.'" "'.$rootTmpDir.'/'.$tmpDir.'"');
    }

    if (strpos($result, '[ERROR]') !== false) {
        echo '{ "error": "'.$result.'", "initialBundle": "'.isset($_GET['adminPassword']).'" }';
        die();
    }
    $output .= $result;
    $output .= "***************";

    $zipName = $applicationName.'-bundle-'.$timestamp.'.zip';

    $output .= $rootTmpDir.'/'.$tmpDir."/bundle-".$applicationName.' : ';
    $output .= $zipName;

    chdir($currentDir);

    zipData($rootTmpDir.'/'.$tmpDir.'/'.$applicationName, $zipName);

    header('Content-Type: application/octet-stream');
    header("Content-Disposition: attachment; filename='" . basename($zipName) . "'");
    header('Content-Length: ' . filesize($zipName));
    readfile($zipName);
    unlink($zipName);
?>