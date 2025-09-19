#!/usr/bin/env bash
set -Eeuo pipefail

trap 'echo "❌ Erro na linha $LINENO"; exit 1' ERR
trap '[[ -n "${JAR:-}" && -f "$JAR" ]] && rm -f "$JAR" || true' EXIT

CODE="${1:-5NI291}"
EMAIL_PREFIX="${2:-teste.afiliado}"
EMAIL="${EMAIL_PREFIX}+$(date +%s)@exemplo.com"
FRONT_URL="${FRONTEND_URL:-https://www.betforbes.com}"
JAR="$(mktemp)"
# --------- DB_URL robusto (usa .env se disponível; senão defaults) ---------
DB_URL_ENV="${DATABASE_URL:-}"
if [[ -z "$DB_URL_ENV" && -f .env ]]; then
  set +u
  set -a; source .env; set +a
  DB_URL_ENV="${DATABASE_URL:-}"
  set -u
fi

if [[ -n "$DB_URL_ENV" ]]; then
  DB_URL="${DB_URL_ENV%%\?*}"   # remove ?schema=public do Prisma
else
  DB_HOST="${PGHOST:-127.0.0.1}"
  DB_PORT="${PGPORT:-5432}"
  DB_USER="${PGUSER:-postgres}"
  DB_PASS="${PGPASSWORD:-bf123}"
  DB_NAME="${PGDATABASE:-betforbes}"
  DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

echo "[1/4] /r/$CODE -> cookie"
HDRS="$(curl -sS -k -D - -o /dev/null -c "$JAR" "$FRONT_URL/r/$CODE")"
echo "$HDRS" | egrep -i 'HTTP/|set-cookie|location' || true

# validações dos headers
echo "$HDRS" | head -n1 | grep -qE 'HTTP/.* 302' || { echo "❌ Esperava HTTP 302 no /r/$CODE"; exit 1; }
echo "$HDRS" | grep -qi '^set-cookie: .*bf_ref='   || { echo "❌ Set-Cookie bf_ref ausente"; exit 1; }
echo "$HDRS" | grep -qiE '^location: .*/cadastro\?ref=' || { echo "❌ Location de redirect inesperado"; exit 1; }

echo "[2/4] register (sem referral no body)"
REGISTER_JSON="$(curl -sS -k -b "$JAR" -H 'Content-Type: application/json' \
  -d '{"name":"Smoke","email":"'"$EMAIL"'","password":"SenhaFort3!","confirmPassword":"SenhaFort3!"}' \
  "$FRONT_URL/api/auth/register")"

if command -v jq >/dev/null 2>&1; then
  echo "$REGISTER_JSON" | jq .
else
  echo "$REGISTER_JSON"
fi
# falha se o register não retornar success:true
echo "$REGISTER_JSON" | grep -q '"success":\s*true' || { echo "❌ Registro falhou (sem success:true)"; exit 1; }

echo "[3/4] conferir no banco (estrito)"
echo "EMAIL=$EMAIL"
psql "$DB_URL" -v ON_ERROR_STOP=1 -t -A -F',' -X -c "
SELECT u.email, COALESCE(r.email,'') AS referenciador, COALESCE(r.\"referralCode\",'') AS ref_code
FROM public.users u
LEFT JOIN public.users r ON r.id = u.\"referredBy\"
WHERE u.email = '${EMAIL}';
" | while IFS=, read -r uemail refemail refcode; do
  echo "EMAIL=$uemail  REF=$refemail  CODE=$refcode"
  if [ -z "$refemail" ] || [ -z "$refcode" ]; then
    echo '❌ Não encontrou referenciador/código'; exit 1
  fi
done

echo "[4/4] ok ✅"
