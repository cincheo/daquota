
<?php

    function createZip($zipName, $rootPath) {
        $zip = new ZipArchive();
        $res = $zip->open($zipName, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($rootPath),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file)
        {
            // Skip directories (they would be added automatically)
            if (!$file->isDir())
            {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen($rootPath) + 1);

                $res = $zip->addFile($filePath, $relativePath);
            }
        }

        // Zip archive will be created only after closing object
        $res = $zip->close();
    }

    function rmdir_recursive($dir) {
        foreach(scandir($dir) as $file) {
           if ('.' === $file || '..' === $file) continue;
           if (is_dir("$dir/$file")) rmdir_recursive("$dir/$file");
           else unlink("$dir/$file");
       }

       rmdir($dir);
    }



?>