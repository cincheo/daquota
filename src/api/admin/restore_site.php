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
    $rootPath = realpath('../..');
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
            $error = true;
            $message = "The file you are trying to upload is not a .zip file. Please try again.";
        } else {

            // BACKUP
            if (!is_dir($rootTmpDir.'/site_backup')) {
                mkdir($rootTmpDir.'/site_backup', 0777);
            }
            zipData(realpath($SYNC_DATA_DIR), $rootTmpDir.'/site_backup/'.$_GET['app'].'-site-'.date('Y-m-d-H-i-s-u').'.zip');


            if (!is_dir($rootTmpDir.'/site_upload')) {
                mkdir($rootTmpDir.'/site_upload', 0777);
            }
            $targetZip = $rootTmpDir.'/site_upload/' . $filename; // target zip file
            $targetTmpDir = $rootTmpDir.'/site_upload/' . basename($filename); // target zip file

//             if (is_dir($rootPath)) {
//                 rmdir_recursive($rootPath);
//             }
//             mkdir($rootPath, 0777);

            /* here it is really happening */

            if(move_uploaded_file($source, $targetZip)) {
                $zip = new ZipArchive();
                $x = $zip->open($targetZip);
                if ($x === true) {
                    $zip->extractTo($targetTmpDir);
                    $zip->close();

                    //unlink($targetZip);
                }
            } else {
                $error = true;
                $message = "There was a problem with the upload. Please try again. " . $source . ' - ' . $targetZip . ' - ' . $rootPath;
            }

            // CHECK UPLOADED BUNDLE VALIDITY
            if (
                !file_exist($targetTmpDir.'/index.html' ||
                !file_exist($targetTmpDir.'/api/config.php' ||
                !is_dir($targetTmpDir.'/assets'
            ) {
                $error = true;
                $message = "Missing required file.";
            } else {
                $matches = [];
                foreach (scandir($targetTmpDir) as $file) {
                    if (preg_match('/([^-]*)-(^_]*)_(.*)\.min.js/', $file, $matches) {
                        $appName = $matches[1];
                        $dliteVersion = $matches[2];
                        $bundleVersion = $matches[3];
                        $bundleName = $file;
                    }
                }
                if (!isset($bundleName)) {
                    $error = true;
                    $message = "Missing bundle file.";
                } else {
                    foreach (scandir($rootPath) as $file) {
                        if (preg_match('/([^-]*)-(^_]*)_(.*)\.min.js/', $file, $matches) {
                            if ($appName != $matches[1]) {
                                $error = true;
                                $message = "Wrong application upgrade (name is different).";
                            }
                            if ($file == $bundleName) {
                                $error = true;
                                $message = "Wrong application upgrade (same version).";
                            }
                        }
                    }
                }
            }

            // backup current configuration
            if (!isset($message)) {
                copy($rootPath.'/api/config.php', $rootTmpDir.'/site_backup/config.php');
            }

//             if (is_dir($rootPath)) {
//                 rmdir_recursive($rootPath);
//             }
//             mkdir($rootPath, 0777);

            $zip = new ZipArchive();
            $x = $zip->open($targetZip);
            if ($x === true) {
                $zip->extractTo($rootPath);
                $zip->close();
                unlink($targetZip);
            }

            // restore current configuration
            copy($rootTmpDir.'/site_backup/config.php', $rootPath.'/api/config.php');
            $message = 'Successfully upgraded site';
        }
    }
    if (isset($error)) {
        echo '{ "error": true, "result": "'.$message.'"}';
    } else {
        echo '{ "result": "'.$message.'"}';
    }
?>