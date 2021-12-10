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

    $body = file_get_contents('php://input');
    $applicationModel = json_decode($body, true);
    $applicationName = $applicationModel['name'];

    $tmpDir = 'tmp-bundle-'.$_GET['user'].'-'.$applicationName.'-'.date('Y-m-d-H-i-s-u');
    mkdir($tmpDir, 0777);
    $applicationFile = $tmpDir.'/'.$applicationName.'.dlite';

    file_put_contents($applicationFile, file_get_contents('php://input'));
    $bundleScript = realpath('../../..').'/bundle.sh';

    chdir('../../..');
    $output = shell_exec('"'.$bundleScript.'" "'.$applicationFile.'" "'.$tmpDir.'"');
    //$output = shell_exec('cd ../..; pwd');
    //$output = '"'.realpath('../..').'/bundle.sh"';
    //$output = exec('sh "'.realpath('../..').'/bundle.sh" > out.txt');
    //$output = realpath('../..');
    //$output = shell_exec('cd ../..; /Users/renaudpawlak/Development/eclipse-workspace-jac/dlite-ide/bundle.sh');

    //chdir('..');

    //$output = exec('pwd');

    //$zipName = $tmpDir . '/' . $applicationName . '-bundle-'.date('Y-m-d-H-i-s-u').'.zip';

    //createZip($zipName, $tmpDir);

//     header('Content-Type: application/zip');
//     header("Content-Disposition: attachment; filename='" . $zipName . "'");
//     header('Content-Length: ' . filesize($zipName));
//     header("Location: " . $zipName);

    echo $output;

    ?>

