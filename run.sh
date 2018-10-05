#!/usr/bin/env bash

echo "You need docker and docker-compose to run the test scenario"
docker-compose up -d
arr=( "http://localhost:8000/meals" )
for url in "${arr[@]}";do
    declare status
    for retry in 1 2 3 4 5 6;do
        status=$(curl -s --head ${url} | head -1 | wc -l)
        if [ $status -eq 1 ];then
            break
        fi
        sleep 2
    done
    if [ $status -eq 1 ];then
        echo ${url} ${status}
    else
        echo "Failed can't access" ${url}
        docker-compose down
        exit -2
    fi
done
cd scenario_test
npm start
if [ $? -ne 0 ]
then
    echo "Test failed"
    docker-compose down
    exit 1
fi
docker-compose down
echo "Test succeeded"