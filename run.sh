#!/usr/bin/env bash

docker-compose build
docker-compose up -d
arr=( "http://localhost:8000/meals" "http://localhost:8080/meals" )
for url in "${arr[@]}";do
    declare status
    for retry in 1 2 3 4 5;do
        status=$(curl -s --head ${url} | head -1 | grep 'OK' | wc -l)
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
docker-compose down
echo "All urls accessible"