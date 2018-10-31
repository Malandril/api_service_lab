#!/usr/bin/env bash

docker-compose up -d
sleep 20 # waiting for the webservice and kafka to be ready
bash ./run.sh
exit $?