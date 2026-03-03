#!/bin/bash

# `pnpm dev` bootstrap:
# 1) hosts 등록
# 2) 로컬 HTTPS 인증서 생성
# 3) local alias 서버 실행 + 브라우저 오픈

set -euo pipefail

if [ -f .env.local ]; then
  echo ".env.local is not supported in this project."
  echo "Use .env only and move values from .env.local to .env."
  exit 1
fi

# Load `.env` once so shell scripts also use the same env source as Next.js.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

# Local alias settings are intentionally hardcoded here (not managed by .env).
LOCAL_ALIAS_HOST_FIXED="local.1day1streak.com"
LOCAL_ALIAS_PROTOCOL_FIXED="https"
LOCAL_ALIAS_PORT_FIXED="443"
LOCAL_SSL_KEY_PATH_FIXED="_wildcard.1day1streak.com-key.pem"
LOCAL_SSL_CERT_PATH_FIXED="_wildcard.1day1streak.com.pem"

export LOCAL_ALIAS_HOST="$LOCAL_ALIAS_HOST_FIXED"
export LOCAL_ALIAS_PROTOCOL="$LOCAL_ALIAS_PROTOCOL_FIXED"
export LOCAL_ALIAS_PORT="$LOCAL_ALIAS_PORT_FIXED"
export LOCAL_SSL_KEY_PATH="$LOCAL_SSL_KEY_PATH_FIXED"
export LOCAL_SSL_CERT_PATH="$LOCAL_SSL_CERT_PATH_FIXED"

DOMAIN="$LOCAL_ALIAS_HOST_FIXED"
PROTOCOL="$LOCAL_ALIAS_PROTOCOL_FIXED"

bash ./scripts/init-local-dns.sh "$DOMAIN"

if [ "$PROTOCOL" = "https" ]; then
  bash ./scripts/init-local-cert.sh "$DOMAIN"
fi

exec node dev-server.js
