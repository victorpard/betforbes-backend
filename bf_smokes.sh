#!/usr/bin/env bash
# BetForbes — backend smokes (login, affiliate stats, register with ref, forgot-password)
# Requisitos: bash, curl, jq, python3 (para extrair o ref do link)
set -euo pipefail

# ---------- Config ----------
BASE="${BASE:-https://betforbes.com}"
AFF_EMAIL="${AFF_EMAIL:-aikonoutlet@gmail.com}"
AFF_PASS="${AFF_PASS:-100787Vh!}"
NEW_NAME="${NEW_NAME:-Smoke Register}"
NEW_PASS="${NEW_PASS:-Test1234!a}"         # deve cumprir as regras do backend
NEW_EMAIL="smoke.$(date +%s)@example.com"  # email único por execução

# ---------- Helpers ----------
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ falta a ferramenta '$1'"; exit 1; }; }
need curl
need jq
need python3

say() { echo -e "\n==> $*"; }
json() { jq -r '.'; }
grab_token() { jq -r '.accessToken // .data.tokens.accessToken // .token // empty'; }
extract_ref_code() {
  python3 - "$1" <<'PY' 2>/dev/null || true
import sys, urllib.parse as u
url=sys.argv[1] if len(sys.argv)>1 else ""
q=u.urlparse(url).query
print(dict(u.parse_qsl(q)).get("ref",""))
PY
}

# ---------- 0) Sanity: health/version ----------
say "Health check"
curl -fsS "$BASE/api/health" -o /dev/null && echo "OK"

say "Version"
curl -fsS "$BASE/api/version" | json

# ---------- 1) Login do afiliador ----------
say "Login do afiliador ($AFF_EMAIL)"
ACCESS="$(curl -fsS -X POST "$BASE/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data "$(jq -n --arg e "$AFF_EMAIL" --arg p "$AFF_PASS" '{email:$e,password:$p}')" \
  | grab_token)"
test -n "$ACCESS" || { echo "❌ Não obtive accessToken no login do afiliador"; exit 1; }
echo "✅ token obtido (${#ACCESS} chars)"

# ---------- 2) /auth/validate ----------
say "/auth/validate"
curl -fsS -H "Authorization: Bearer $ACCESS" "$BASE/api/auth/validate" | json

# ---------- 3) /users/profile ----------
say "/users/profile"
curl -fsS -H "Authorization: Bearer $ACCESS" "$BASE/api/users/profile" | json

# ---------- 4) /affiliates/stats e extrair referralLink/refCode ----------
say "/affiliates/stats"
STATS="$(curl -fsS -H "Authorization: Bearer $ACCESS" "$BASE/api/affiliates/stats")"
echo "$STATS" | jq

REF_LINK="$(echo "$STATS" | jq -r '.referralLink // .data.referralLink // empty')"
test -n "$REF_LINK" || { echo "❌ referralLink não encontrado no /affiliates/stats"; exit 1; }
echo "referralLink: $REF_LINK"

REF_CODE="$(extract_ref_code "$REF_LINK")"
test -n "$REF_CODE" || { echo "❌ não foi possível extrair ?ref=CODE do referralLink"; exit 1; }
echo "refCode: $REF_CODE"

# ---------- 5) Registro de novo usuário com ?ref=CODE ----------
say "Cadastro com referral (?ref=$REF_CODE) — email: $NEW_EMAIL"
HTTP_CODE="$(mktemp)"
BODY_FILE="$(mktemp)"
curl -i -sS -o "$BODY_FILE" -w "%{http_code}" -X POST "$BASE/api/auth/register?ref=$REF_CODE" \
  -H 'Content-Type: application/json' \
  --data "$(jq -n --arg n "$NEW_NAME" --arg e "$NEW_EMAIL" --arg p "$NEW_PASS" \
      '{name:$n,email:$e,password:$p,confirmPassword:$p}')" > "$HTTP_CODE"

CODE="$(cat "$HTTP_CODE")"
echo "HTTP: $CODE"
cat "$BODY_FILE" | json || true
if [[ "$CODE" != "201" && "$CODE" != "200" ]]; then
  echo "❌ Cadastro não retornou 201/200"
  exit 1
fi
echo "✅ Cadastro OK"

# ---------- 6) Rechecar /affiliates/stats ----------
say "Rechecar /affiliates/stats (contagem deve subir)"
sleep 2
curl -fsS -H "Authorization: Bearer $ACCESS" "$BASE/api/affiliates/stats" | jq

# ---------- 7) Forgot password para o novo usuário ----------
say "Forgot password (password reset) para $NEW_EMAIL"
curl -fsS -X POST "$BASE/api/auth/forgot-password" \
  -H 'Content-Type: application/json' \
  --data "$(jq -n --arg e "$NEW_EMAIL" '{email:$e}')" | json

echo -e "\n🎉 Smokes concluídos com sucesso."
echo "➤ Novo usuário criado: $NEW_EMAIL (senha: $NEW_PASS) com ref=$REF_CODE"
