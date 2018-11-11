#!/usr/bin/env bash
set -e
for i in $(seq 1 20)
do
    echo "doing $i"
    node kafka_test.js > $i.log &
done
i=0
for job in `jobs -p`
do
    ((++i))
    echo $i
    wait $job || let "FAIL+=1"
done