#!/usr/bin/env bash
set -e
echo "To install the project you must have node and npm installed"
for folder in $(ls -d */)
do
    if [ $folder/package.json ]; then
        cd $folder
        echo entering $folder
            npm install
        cd ..
    fi
done
