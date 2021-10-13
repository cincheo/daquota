<?php

    include 'config.php';
    include 'rest_headers.php';

    if ($_GET['user'] == $_GET['target_user']) {
        echo '{ "error": "cannot share for yourself - select a different target user", "user": "'.$_GET['user'].'" }';
    }
    if (!isset($_GET['user'])) {
        echo '{ "error": "user is not provided" }';
    }
    if (!isset($_GET['target_user'])) {
        echo '{ "error": "target user is not provided" }';
    }

    $dir = $SYNC_DATA_DIR.'/'.$_GET['user'];
    $key = $_GET['key'];
    $target_dir = $SYNC_DATA_DIR.'/'.$_GET['target_user'];

    // if the user does not have a space yet, we create it so that s/he will access the data when joining the system
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $file = $dir.'/'.$key.'.json';
    $result = false;
    $target = '../'.$_GET['user'].'/'.$key.'.json';

    if (file_exists($file)) {
        $link = $target_dir.'/'.$key.'-$-'.$_GET['user'].'.json';
        $result = unlink($link);
        $result = symlink($target, $link);
    }

    echo '{ "target": "'.$target.'", "link": "'.$link.'", "result": "'.$result.'" }';

?> 

