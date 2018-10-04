#!/usr/bin/env bash


for folder in commons coursier order restaurant
do
    cd ${folder}
    echo entering $folder
    if [ ./package.json ]; then
        npm install
        npm run build
    fi
    cd ..
done
read  -n 1 -p "Press any key to exit"
