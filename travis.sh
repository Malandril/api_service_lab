#!/usr/bin/env bash

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
        exit 2
    fi
done
bash ./run.sh
exit $?