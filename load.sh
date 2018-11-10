#!/usr/bin/env bash
echo "To run the load tests, you must have java and maven installed"
cd load_tests
mvn gatling:test