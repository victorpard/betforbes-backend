#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

DBURL_CLEAN="${DBURL_CLEAN:?Defina DBURL_CLEAN (postgresql://...)}"
BASE="${BASE:-https://betforbes.com}"

echo "== DB: função/trigger/segurança =="
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT p.proname, p.prosecdef AS security_definer, p.proconfig AS proconfig
FROM pg_proc p
JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname='trg_fn_users_mirror_aff_v2';
"
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT tg.tgname, pr.proname
FROM pg_trigger tg
JOIN pg_proc pr ON pr.oid=tg.tgfoid
JOIN pg_class c  ON c.oid=tg.tgrelid
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname='users' AND tg.tgname='trg_users_mirror_aff';
"

echo -e "\n== DB: índices de affiliate_referrals =="
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT indexname,indexdef
FROM pg_indexes
WHERE schemaname='public' AND tablename='affiliate_referrals'
ORDER BY indexname;
"

echo -e "\n== API: health =="
curl -fsS "$BASE/api/health" >/dev/null && echo "Health OK" || echo "FAIL: /api/health"

# Parte opcional: login afiliador só se variáveis existirem (sem segredos no repositório)
AFF_EMAIL="${BF_AFF_EMAIL:-}"
AFF_PASS="${BF_AFF_PASS:-}"
if [ -n "${AFF_EMAIL}" ] && [ -n "${AFF_PASS}" ]; then
  echo -e "\n== API: login afiliador e /affiliates/stats =="
  ACCESS=$(
    curl -fsS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
    --data "$(jq -n --arg e "$AFF_EMAIL" --arg p "$AFF_PASS" '{email:$e,password:$p}')" \
    | jq -r '.accessToken // .token // empty'
  )
  if [ -n "$ACCESS" ]; then
    curl -fsS -H "Authorization: Bearer $ACCESS" "$BASE/api/affiliates/stats" | jq .
  else
    echo "Aviso: falhou login do afiliador (variáveis inválidas?)"
  fi
else
  echo -e "\n(Aviso) Pulando teste de afiliador: defina BF_AFF_EMAIL e BF_AFF_PASS no ambiente se quiser validar."
fi

echo -e "\n== DB: últimos vínculos em affiliate_referrals (top 5) =="
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT u.email, ar.parent_user_id, ar.child_user_id, ar.\"createdAt\"
FROM public.affiliate_referrals ar
JOIN public.users u ON u.id::uuid = ar.child_user_id
ORDER BY ar.\"createdAt\" DESC
LIMIT 5;
"
echo "✅ OK: guard finalizado."
