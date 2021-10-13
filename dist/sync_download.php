<?php

    include 'config.php';
    include 'rest_headers.php';

    function str_ends_with( $haystack, $needle ) {
        $length = strlen( $needle );
        if( !$length ) {
            return true;
        }
        return substr( $haystack, -$length ) === $needle;
    }

    $dir = $SYNC_DATA_DIR.'/'.$_GET['user'];
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
                $file = $dir.'/'.$files[$i];
                if (is_link($file) && str_ends_with(readlink($file), '/unshared')) {
                    $result['keys'][$key] = array(
                        'status' => 'unshared'
                    );
                } else {
                    $serverData = json_decode(file_get_contents($file), true);
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
    }
    echo json_encode($result);

?> 
