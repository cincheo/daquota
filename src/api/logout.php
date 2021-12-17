<?php

    include 'config.php';
    include 'rest_headers.php';

    session_start();
    session_destroy();
    echo '{ "result":true }';

?>