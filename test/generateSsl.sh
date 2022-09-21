#!/bin/bash

set -e

CURRENT_FOLDER=$(dirname $0)
CERTS=${CURRENT_FOLDER}/ssl
SUBJECT="/CN=localhost/OU=hackolade/O=hackolade/L=Lviv/C=US"
CA_SUBJECT="/CN=${HOST_DNS_FOR_SSL:-volodymyr.local}/OU=hackolade/O=hackolade/L=Lviv/C=US"

echo "generating certificates in $CERTS folder..."
rm -rf $CERTS/*

openssl genrsa 2048 > $CERTS/ca-key.pem

openssl req -new -x509 -nodes -days 365000 \
	-subj  $CA_SUBJECT\
	-key $CERTS/ca-key.pem -out $CERTS/ca-cert.pem

# server key
openssl req -newkey rsa:2048 -days 365000 \
	  -subj $SUBJECT \
	  -nodes -keyout $CERTS/server-key.pem -out $CERTS/server-req.pem

openssl rsa -in $CERTS/server-key.pem -out $CERTS/server-key.pem

openssl x509 -req -in $CERTS/server-req.pem -days 365000 \
      -CA $CERTS/ca-cert.pem -CAkey $CERTS/ca-key.pem -set_serial 01 \
      -out $CERTS/server-cert.pem

# client key
openssl req -newkey rsa:2048 -days 365000 \
	  -subj $SUBJECT \
	  -nodes -keyout $CERTS/client-key.pem -out $CERTS/client-req.pem

openssl rsa -in $CERTS/client-key.pem -out $CERTS/client-key.pem

openssl x509 -req -in $CERTS/client-req.pem -days 365000 \
      -CA $CERTS/ca-cert.pem -CAkey $CERTS/ca-key.pem -set_serial 01 \
      -out $CERTS/client-cert.pem

# check key ok
openssl verify -CAfile $CERTS/ca-cert.pem $CERTS/server-cert.pem $CERTS/client-cert.pem

chmod 777 -R $CERTS
