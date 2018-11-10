#!/usr/bin/env bash

set -e
function cleanup {
    echo  "===== exited with $? ====="
    echo "cleaning up"
    docker-compose down
    }
trap cleanup EXIT


folders=$(ls -d */)
if [ $# -eq 1 ]; then
    folders=$1
fi
for f in $folders
do
    echo $f
    if [ -f $f/test/docker-compose.yml ]; then
        cd "$f/test/"
        echo "===== entering $f ====="
        docker-compose  build
        docker-compose  -f "./docker-compose-test.yml" build
        docker-compose  up --force-recreate -d 
        sleep 10
        echo "===== running test $f ====="
        docker-compose -f "./docker-compose-test.yml" run test --no-deps
        docker-compose down
        cd ../..
    fi
done


for f in pricer
do
    echo $f
    cd $f
    npm test
    cd ..
done