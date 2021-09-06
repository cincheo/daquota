<?php
    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
        // you want to allow, and if so:
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        #header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }
    
    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    
        exit(0);
    }
    
    header('Content-type: application/json');

    if ($_GET['user'] == $_GET['target_user']) {
        echo '{ "error": "cannot unshare for yourself - select a different target user", "user": "'.$_GET['user'].'" }';
    }
    if (!isset($_GET['user'])) {
        echo '{ "error": "user is not provided" }';
    }
    if (!isset($_GET['target_user'])) {
        echo '{ "error": "target user is not provided" }';
    }

    $dir = '../dlite/'.$_GET['user'];
    $key = $_GET['key'];
    $target_dir = '../dlite/'.$_GET['target_user'];

    $file = $dir.'/'.$key.'.json';
    $result = false;
    $target = '../'.$_GET['user'].'/unshared';

    if (file_exists($file)) {
        $link = $target_dir.'/'.$key.'-$-'.$_GET['user'].'.json';
        $result = unlink($link);
        $result = symlink($target, $link);
    }

    echo '{ "target": "'.$target.'", "link": "'.$link.'", "result": "'.$result.'" }';


?>