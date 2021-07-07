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

    $dir = '../DLITE_DATA/'.$_GET['user'];
	if (!is_dir($dir)) {
	  mkdir($dir);
	}

	$body = file_get_contents("php://input");

    $clientDescriptor = json_decode($body, true);

    $lockFileName = $dir.'/'."__dlite_sync_descriptor.json";
    $lock = fopen($lockFileName, "c+");
    if (flock($lock, LOCK_EX)) {
    	
		$syncResult = array('keys' => array());
    	$descriptorSize = filesize($lockFileName);

    	if ($descriptorSize == false || $descriptorSize == 0) {
	        $serverDescriptor = array('keys' => array());
    	} else {
		    $content = fread($lock, $descriptorSize);
		    if ($content == false) {
		        $serverDescriptor = array('keys' => array());
		    } else {
		        $serverDescriptor = json_decode($content, true);
		    }
		}

		$syncResult['serverDescriptorSize'] = $descriptorSize;
		$syncResult['serverDescriptor'] = $serverDescriptor;
		$syncResult['clientDescriptor'] = $clientDescriptor;

		foreach ($clientDescriptor['keys'] as $key => $value) {
	        if (!array_key_exists($key, $serverDescriptor['keys'])) {
	            $serverDescriptor['keys'][$key] = array('version' => 0);
	        }
	        $serverVersion = $serverDescriptor['keys'][$key]['version'];
	        $clientVersion = array_key_exists('version', $value) ? $value['version'] : 0;
	        if ($serverVersion == $clientVersion && array_key_exists('data', $value)) {
	        	$file = $dir.'/'.$key.'.json';
				$writeResult = file_put_contents($file, $value['data']);
				if (!$writeResult) {
					$syncResult['keys'][$key]['written'] = false;
					$syncResult['keys'][$key]['error'] = "writing file content failed";
					$syncResult['keys'][$key]['file'] = $file;
				} else {
					$syncResult['keys'][$key]['written'] = $writeResult;						
			        $serverDescriptor['keys'][$key]['version'] = $serverDescriptor['keys'][$key]['version'] + 1;
			        $syncResult['keys'][$key]['version'] = $serverDescriptor['keys'][$key]['version'];
				}
	        } else {
				$syncResult['keys'][$key]['written'] = false;
				if ($serverVersion != $clientVersion) {
					$syncResult['keys'][$key]['error'] = "server version ($serverVersion) != client version ($clientVersion)";
				} else {
					$syncResult['keys'][$key]['error'] = "data is not defined";
				}
	        }
	    }

	    //$serverDescriptor = array("test" => "ok");

	    rewind($lock);
	    ftruncate($lock, 0);
	    fwrite($lock, json_encode($serverDescriptor));

	    //flock($lock, LOCK_UN)

	    echo json_encode($syncResult);

	} else {
		echo '{ "result": "error opening lock file" }';
	}

?> 

