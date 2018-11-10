#!/usr/bin/env bash



set -e
function cleanup {
    echo "cleaning up"
    docker-compose down
    }

docker-compose up -d
sleep 20 # waiting for the webservice and kafka to be ready
bash ./run.sh

trap cleanup EXIT
#bash ./test.sh
