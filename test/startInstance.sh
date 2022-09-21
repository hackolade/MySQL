#!/bin/bash

set -e

DB_IS_READY='Hackolade database instance is ready to test!'
DB_IS_NOT_READY='Hackolade database instance did not start!'


echo "--> starting mysql test instances..."
docker-compose up -d --wait --force-recreate

# Retrieve auto generated certificates
docker cp test-mysql-ssl-certificates-1:/ssl .

if [ "$?" -eq "0" ]; then
	echo $DB_IS_READY;
else
	echo $DB_IS_NOT_READY;
fi
