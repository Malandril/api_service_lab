#!/usr/bin/env bash
set -e
cd scenario_test
npm start
if [ $? -ne 0 ]
then
    echo "Test failed"
    exit 1
fi
docker-compose logs
echo "Test succeeded"
