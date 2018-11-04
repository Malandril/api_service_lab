#!/usr/bin/env bash

set -e
function cleanup {
    echo  "===== exited with $? ====="
    echo "cleaning up"
    docker-compose down
    }
trap cleanup EXIT

for f in $(ls -d */)
do
    if [ -f $f/test/docker-compose.yml ]; then
        cd "$f/test/"
        echo "===== entering $f ====="
        docker-compose  build
        docker-compose  -f "./docker-compose-test.yml" build
        docker-compose  up &
        sleep 5
        echo "===== running test ====="
        docker-compose -f "./docker-compose-test.yml" run test --no-deps
        docker-compose down
        cd ../..
    fi
done