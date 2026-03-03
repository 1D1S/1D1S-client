#!/bin/bash

# Usage:
# pnpm run init:local-dns -- <domain>

set -euo pipefail

DOMAIN="${1:-}"

if [ "$DOMAIN" = "--" ]; then
  DOMAIN="${2:-}"
fi

if [ -z "$DOMAIN" ]; then
  echo "Usage: pnpm run init:local-dns -- <domain>"
  exit 1
fi

if [[ "$DOMAIN" == -* ]]; then
  echo "Invalid domain: $DOMAIN"
  echo "Usage: pnpm run init:local-dns -- <domain>"
  exit 1
fi

HOSTS_FILE="/etc/hosts"
HOSTS_ENTRY="127.0.0.1\t${DOMAIN}"
ESCAPED_DOMAIN="$(printf '%s' "$DOMAIN" | sed -e 's/[][(){}.^$*+?|/\\]/\\&/g')"

if grep -Eq "^[[:space:]]*127\\.0\\.0\\.1[[:space:]]+${ESCAPED_DOMAIN}([[:space:]]|\$)" "$HOSTS_FILE"; then
  echo "'$DOMAIN' already exists in hosts file."
  exit 0
fi

echo -e "$HOSTS_ENTRY" | sudo tee -a "$HOSTS_FILE" >/dev/null
echo "Added $DOMAIN to hosts file."
