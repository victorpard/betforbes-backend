#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://betforbes.com}"
EMAIL="${EMAIL:-aikonoutlet@gmail.com}"
PASS="${PASS:-100787Vh!}"

say(){ printf "\033[1;36m%s\033[0m\n" "$*"; }

say "→ health/version ($BASE)"
curl -fsS "$BASE/api/health"  | jq -r '.ok, .name?'; echo
curl -fsS "$BASE/api/version" | jq -r '.service, .version, .commit'; echo

say "→ login (capturando token)"
ACCESS="$(
  curl -fsS -X POST "$BASE/api/auth/login" \
    -H 'Content-Type: application/json' \
    --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  | jq -r '.accessToken // .data.tokens.accessToken // .token // empty'
)"
if [ -z "$ACCESS" ]; then
  echo "ERRO: não foi possível extrair access token"; exit 1
fi

say "→ validate"
curl -fsS -H "Authorization: Bearer $ACCESS" \
  "$BASE/api/auth/validate" | jq -r '.success, .user.email'; echo

say "→ profile"
curl -fsS -H "Authorization: Bearer $ACCESS" \
  "$BASE/api/users/profile" | jq -r '.success, .user.name, .user.isVerified'; echo

say "→ affiliates/stats"
curl -fsS -H "Authorization: Bearer $ACCESS" \
  "$BASE/api/affiliates/stats" | jq -r '.success, .data.referralLink'; echo

say "✓ Smoke PROD OK"
