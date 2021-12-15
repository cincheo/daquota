<?php
    if (!isset($_GET['app'])) {
        echo '{ "error": "app is not provided" }';
        die();
    }

    include '../config.php';
    include '../rest_headers.php';
    include 'init_admin_session.php';
    include 'tools.php';

	//$body = file_get_contents("php://input");
    $rootPath = $SYNC_DATA_DIR;
    $rootTmpDir = sys_get_temp_dir();

    if($_FILES["file"]["name"]) {
        $filename = $_FILES["file"]["name"];
        $source = $_FILES["file"]["tmp_name"];
        $type = $_FILES["file"]["type"];

        $name = explode(".", $filename);
        $accepted_types = array('application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/x-compressed');
        foreach($accepted_types as $mime_type) {
            if($mime_type == $type) {
                $okay = true;
                break;
            }
        }

        $continue = strtolower($name[1]) == 'zip' ? true : false;
        if(!$continue) {
            $message = "The file you are trying to upload is not a .zip file. Please try again.";
        } else {

            // BACKUP
            if (!is_dir($rootTmpDir.'/snapshots_backup')) {
                mkdir($rootTmpDir.'/snapshots_backup', 0777);
            }
            zipData(realpath($SYNC_DATA_DIR), $rootTmpDir.'/snapshots_backup/'.$_GET['app'].'-snapshot-'.date('Y-m-d-H-i-s-u').'.zip');


            if (!is_dir($rootTmpDir.'/snapshots_upload')) {
                mkdir($rootTmpDir.'/snapshots_upload', 0777);
            }
            $targetZip = $rootTmpDir.'/snapshots_upload/' . $filename; // target zip file

            if (is_dir($rootPath)) {
                rmdir_recursive($rootPath);
            }
            mkdir($rootPath, 0777);

            /* here it is really happening */

            if(move_uploaded_file($source, $targetZip)) {
                $zip = new ZipArchive();
                $x = $zip->open($targetZip);  // open the zip file to extract
                if ($x === true) {
                    $zip->extractTo($rootPath); // place in the directory with same name
                    $zip->close();

                    unlink($targetZip);
                }
                $message = "Your .zip file was uploaded and unpacked. " . $source . ' - ' . $targetZip . ' - ' . $rootPath;
            } else {
                $message = "There was a problem with the upload. Please try again. " . $source . ' - ' . $targetZip . ' - ' . $rootPath;
            }
        }
    }
    echo '{ "result": "'.$message.'"}';
?>