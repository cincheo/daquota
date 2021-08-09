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

    $dir = '../dlite/'.$_GET['user'];
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

