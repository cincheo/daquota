<?php
    include '../config.php';
    include '../rest_headers.php';
    include 'init_admin_session.php';

    $body = file_get_contents("php://input");

    $account = json_decode($body, true);

    if ($account['oldPassword'] != $ADMIN_PASSWORD || !isset($account['newPassword'])) {
        echo '{ "error": "Invalid password" }';
    } else {
        $config = "<?php\n";
        $config .= "    \$SYNC_DATA_DIR = '".$SYNC_DATA_DIR."';\n";
        $config .= "    \$ADMIN_PASSWORD = '".$account['newPassword']."';\n";
        $config .= "    \$ADMIN_FIRSTNAME = '".$account['firstName']."';\n";
        $config .= "    \$ADMIN_LASTNAME = '".$account['lastName']."';\n";
        $config .= "    \$ADMIN_EMAIL = '".$account['email']."';\n";
        $config .= "?>";
        file_put_contents('../config.php', $config);
        echo '{ "result": "Account successfully updated" }';
    }
?>