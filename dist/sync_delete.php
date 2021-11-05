<?php

    include 'config.php';
    include 'rest_headers.php';

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