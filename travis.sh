#!/usr/bin/env bash

set -e
bash ./test.sh
docker-compose up -d
sleep 20 # waiting for the webservice and kafka to be ready
bash ./run.sh
