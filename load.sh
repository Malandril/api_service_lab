#!/usr/bin/env bash
echo "To run the load tests, you must have Scala 2.12, Java and Maven installed"
cd load_tests
mvn gatling:test