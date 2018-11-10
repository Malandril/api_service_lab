#!/usr/bin/env bash



set -e
function cleanup {
    echo "cleaning up"
    docker-compose logs
    docker-compose down
    }
trap cleanup EXIT

docker-compose up -d
sleep 20 # waiting for the webservice and kafka to be ready
bash ./run.sh

#bash ./test.sh
