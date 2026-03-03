#!/bin/bash

# Usage:
# pnpm run init-local-cert -- <domain>

set -euo pipefail

DOMAIN="${1:-}"

if [ "$DOMAIN" = "--" ]; then
  DOMAIN="${2:-}"
fi

if [ -z "$DOMAIN" ]; then
  echo "Usage: pnpm run init-local-cert -- <domain>"
  exit 1
fi

if [[ "$DOMAIN" == -* ]]; then
  echo "Invalid domain: $DOMAIN"
  echo "Usage: pnpm run init-local-cert -- <domain>"
  exit 1
fi

KEY_PATH="${LOCAL_SSL_KEY_PATH:-_wildcard.1day1streak.com-key.pem}"
CERT_PATH="${LOCAL_SSL_CERT_PATH:-_wildcard.1day1streak.com.pem}"

if [ -f "$KEY_PATH" ] && [ -f "$CERT_PATH" ]; then
  echo "Local cert already exists:"
  echo "- $KEY_PATH"
  echo "- $CERT_PATH"
  exit 0
fi

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert is required to create local HTTPS certs."
  echo "Install guide:"
  echo "- macOS: brew install mkcert nss"
  echo "- Ubuntu: sudo apt install libnss3-tools && curl -JLO https://dl.filippo.io/mkcert/latest?for=linux/amd64"
  exit 1
fi

# local.1day1streak.com -> 1day1streak.com
BASE_DOMAIN="${DOMAIN#*.}"

echo "Installing local CA with mkcert..."
mkcert -install

echo "Generating local HTTPS cert..."
mkcert \
  -key-file "$KEY_PATH" \
  -cert-file "$CERT_PATH" \
  "$DOMAIN" \
  "*.${BASE_DOMAIN}" \
  "${BASE_DOMAIN}" \
  "localhost" \
  "127.0.0.1" \
  "::1"

echo "Generated cert files:"
echo "- $KEY_PATH"
echo "- $CERT_PATH"
