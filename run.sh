#!/usr/bin/env bash
cd scenario_test
npm start
if [ $? -ne 0 ]
then
    echo "Test failed"
    exit 1
fi
echo "Test succeeded"
