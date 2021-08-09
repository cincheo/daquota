<?php

    function str_ends_with( $haystack, $needle ) {
        $length = strlen( $needle );
        if( !$length ) {
            return true;
        }
        return substr( $haystack, -$length ) === $needle;
    }

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

    $result = array('keys' => array());
    if (is_dir($dir)) {
        $files = scandir($dir);
        $total = count($files);
        $result['total'] = $total;
        $result['files'] = $files;
        $result['clientDescriptor'] = $clientDescriptor;
        $result['skipped'] = array();
        for($i = 0; $i <= $total; $i++) {
            if ($files[$i] != '.' && $files[$i] != '..' && str_ends_with($files[$i], '.json')) {
                $key = basename($files[$i], '.json');
                $serverData = json_decode(file_get_contents($dir.'/'.$files[$i]), true);
                if (!array_key_exists('version', $serverData) || !array_key_exists('data', $serverData)) {
                    // skipping wrong file...
                    array_push($result['skipped'], $key);
                    continue;
                }
                $serverVersion = $serverData['version'];
                $clientVersion = array_key_exists($key, $clientDescriptor['keys']) ? $clientDescriptor['keys'][$key]['version'] : 0;
                if ($serverVersion > $clientVersion) {
                    $result['keys'][$key] = array(
                        'version' => $serverVersion,
                        'data' => json_decode($serverData['data'])
                    );
                }
            }
        }
    }
    echo json_encode($result);

?> 
