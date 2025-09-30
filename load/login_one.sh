#!/usr/bin/env bash
set -euo pipefail
email="$1"
pass="$(awk -v e="$email" -F'\t' '$1==e{print $2}' pass.map)"
tries=0; token=""
while [ $tries -lt 4 ] && [ -z "$token" ]; do
  token=$(
    curl -fsS -m 12 --connect-timeout 3 ${RESOLVE_FLAG:-} \
      -X POST "$BASE_URL/api/auth/login" \
      -H 'content-type: application/json' \
      --data-binary "{\"email\":\"$email\",\"password\":\"$pass\"}" \
      | jq -r '.accessToken // .token // empty' 2>/dev/null || echo ""
  )
  [ -n "$token" ] && break
  sleep $(( (RANDOM % 3) + 1 ))
  tries=$((tries+1))
done
[ -n "$token" ] && printf '%s,%s\n' "$email" "$token"
