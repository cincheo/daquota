<?php

    /*
     * d.Lite - low-code platform for local-first Web/Mobile development
     * Copyright (C) 2022 CINCHEO
     *                    https://www.cincheo.com
     *                    renaud.pawlak@cincheo.com
     *
     * This program is free software: you can redistribute it and/or modify
     * it under the terms of the GNU Affero General Public License as
     * published by the Free Software Foundation, either version 3 of the
     * License, or (at your option) any later version.
     *
     * This program is distributed in the hope that it will be useful,
     * but WITHOUT ANY WARRANTY; without even the implied warranty of
     * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     * GNU Affero General Public License for more details.
     *
     * You should have received a copy of the GNU Affero General Public License
     * along with this program. If not, see <https://www.gnu.org/licenses/>.
     */

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

    function zipData($source, $destination) {
        if (extension_loaded('zip')) {
            if (file_exists($source)) {
                $zip = new ZipArchive();
                if ($zip->open($destination, ZIPARCHIVE::CREATE)) {
                    $source = realpath($source);
                    if (is_dir($source)) {
                        $iterator = new RecursiveDirectoryIterator($source);
                        // skip dot files while iterating
                        $iterator->setFlags(RecursiveDirectoryIterator::SKIP_DOTS);
                        $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST);
                        foreach ($files as $file) {
                            $file = realpath($file);
                            if (is_dir($file)) {
                                $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
                            } else if (is_file($file)) {
                                $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
                            }
                        }
                    } else if (is_file($source)) {
                        $zip->addFromString(basename($source), file_get_contents($source));
                    }
                } else {
                    error_log("cannot create zip archive: ".$destination);
                }
                return $zip->close();
            } else {
                error_log("source file does not exist: ".$source);
            }
        } else {
            error_log("zip extension not loaded");
        }
        return false;
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