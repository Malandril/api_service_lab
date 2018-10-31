#!/usr/bin/env bash

set -e
#trap "kill 0" EXIT

for f in payment
do
    if [ -f $f/package.json ]; then
        docker-compose -f "./kafka_test/docker-compose.yml" up -d --force-recreate
        echo "===== Entering $f ====="
        cd $f
        echo "===== Waiting kafka ====="
        sleep 5
        echo "===== Launching service $f ====="
        npm start &
        sleep 5
        echo "===== Launching test for $f ====="
        npm test
        kill $!
        kill %1
        jobs
        cd ..
    fi
done