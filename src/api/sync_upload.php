<?php
    include 'config.php';
    include 'rest_headers.php';
    include 'init_session.php';

    $dir = $SYNC_DATA_DIR.'/'.$_GET['user'];
	if (!is_dir($dir)) {
	  mkdir($dir);
	}

	$body = file_get_contents("php://input");

    $clientDescriptor = json_decode($body, true);

    $syncResult = array('keys' => array());
    $syncResult['clientDescriptor'] = $clientDescriptor;

    foreach ($clientDescriptor['keys'] as $key => $value) {
        $clientVersion = array_key_exists('version', $value) ? $value['version'] : 0;
        if (array_key_exists('data', $value)) {
            $file = $dir.'/'.$key.'.json';

            if (file_exists($file)) {
                $serverValue = json_decode(file_get_contents($file), true);
                if (!array_key_exists('data', $serverValue) || !array_key_exists('version', $serverValue)) {
                    // wrong server file (skip for now, but should we overwrite in a force option?)
                    $syncResult['keys'][$key]['written'] = false;
                    $syncResult['keys'][$key]['error'] = "wrong server file";
                    $syncResult['keys'][$key]['file'] = $file;
                    continue;
                }
                $serverVersion = $serverValue['version'];
            } else {
                // initial push for the current key
                $serverVersion = $clientVersion;
            }

            if ($serverVersion == $clientVersion) {
                $value['version'] = $value['version'] + 1;
                $writeResult = file_put_contents($file, json_encode($value));
                if (!$writeResult) {
                    $syncResult['keys'][$key]['written'] = false;
                    $syncResult['keys'][$key]['error'] = "writing file content failed";
                    $syncResult['keys'][$key]['file'] = $file;
                } else {
                    $syncResult['keys'][$key]['written'] = $writeResult;
                    $syncResult['keys'][$key]['version'] = $value['version'];
                }
            } else {
                $syncResult['keys'][$key]['written'] = false;
                $syncResult['keys'][$key]['error'] = "server version ($serverVersion) != client version ($clientVersion)";
            }
        } else {
            $syncResult['keys'][$key]['written'] = false;
            $syncResult['keys'][$key]['error'] = "client data is not defined";
        }
    }

    echo json_encode($syncResult);


?> 

