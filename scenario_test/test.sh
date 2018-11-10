#!/usr/bin/env bash
set -e
for i in $(seq 1 20)
do
    echo "doing $i"
    node kafka_test.js &
done

for job in `jobs -p`
do
echo $job
    wait $job || let "FAIL+=1"
done