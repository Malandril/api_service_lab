#!/usr/bin/env bash

sleep 20 # waiting for the webservice and kafka to be ready
bash ./run.sh

set -e
function cleanup {
    echo "cleaning up"
    docker-compose down
    }
trap cleanup EXIT
bash ./test.sh
docker-compose up -d
