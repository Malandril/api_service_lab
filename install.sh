#!/usr/bin/env bash


for folder in */
do
    cd ${folder}
    echo entering $folder
    if [ ./package.json ]; then
        npm install uberoo-commons
        npm install
        npm run build
    fi
    cd ..
done
read  -n 1 -p "LOL"
