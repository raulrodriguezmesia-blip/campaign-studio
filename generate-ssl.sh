#!/bin/bash

# Generate self-signed SSL certificate for local development
# For production, use Let's Encrypt or your CA

DOMAIN="campaignstudio.dev"
CERT_DIR="./certs"

# Create certs directory
mkdir -p $CERT_DIR

# Generate private key
openssl genrsa -out $CERT_DIR/private.key 2048

# Generate CSR
openssl req -new -key $CERT_DIR/private.key -out $CERT_DIR/csr.csr -subj "/CN=$DOMAIN"

# Generate certificate
openssl x509 -req -days 365 -in $CERT_DIR/csr.csr -signkey $CERT_DIR/private.key -out $CERT_DIR/certificate.crt

# Clean up
rm $CERT_DIR/csr.csr

echo "SSL certificates generated in $CERT_DIR"
echo "For production, replace with Let's Encrypt certificates"