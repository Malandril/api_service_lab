#!/usr/bin/env bash

echo "To install the project you must have node and npm installed"
for folder in commons coursier order restaurant scenario_test
do
    cd ${folder}
    echo entering $folder
    if [ ./package.json ]; then
        npm install
        npm run build
    fi
    cd ..
done
docker-compose build
read  -n 1 -p "Press any key to exit"