
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


?>