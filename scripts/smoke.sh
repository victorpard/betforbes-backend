#!/usr/bin/env bash
set -euo pipefail

BASE="http://127.0.0.1:3001"
EMAIL="${EMAIL:-aikonoutlet@gmail.com}"
PASS="${PASS:-100787Vh!}"

echo "→ Login"
LOGIN_JSON=$(curl -sS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")

ACCESS=$(echo "$LOGIN_JSON" | jq -r '.accessToken // .data.tokens.accessToken // .token // empty')
[ -n "$ACCESS" ] || { echo "ERRO: accessToken vazio"; exit 1; }

echo "→ Validate"
curl -sS -H "Authorization: Bearer $ACCESS" "$BASE/api/auth/validate" | jq '.success==true' | grep true >/dev/null

echo "→ Profile"
curl -sS -H "Authorization: Bearer $ACCESS" "$BASE/api/users/profile" | jq '.user.email=="'"$EMAIL"'"' | grep true >/dev/null

echo "→ Affiliates stats"
curl -sS -H "Authorization: Bearer $ACCESS" "$BASE/api/affiliates/stats" | jq '.success==true' | grep true >/dev/null

echo "✓ Smoke OK"
