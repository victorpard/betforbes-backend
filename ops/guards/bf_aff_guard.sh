#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "❌ Erro na linha $LINENO"; exit 1' ERR

DBURL_CLEAN="postgresql://bf_prod:BF_prod_2025%21x9@127.0.0.1:5432/betforbes_db"
BASE="https://betforbes.com"
AFF_EMAIL="aikonoutlet@gmail.com"
AFF_PASS='100787Vh!'

echo "== DB: função/trigger/segurança =="
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT p.proname,
       p.prosecdef AS security_definer,
       p.proconfig AS proconfig
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
ORDER BY 1;
"

echo -e "\n== API: health =="
curl -fsS "$BASE/api/health" >/dev/null && echo "Health OK" || { echo "FAIL: /api/health"; exit 1; }

echo -e "\n== API: login afiliador e /affiliates/stats =="
TOKEN=$(
  curl -fsS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  --data "$(jq -n --arg e "$AFF_EMAIL" --arg p "$AFF_PASS" '{email:$e,password:$p}')" \
  | jq -r '.accessToken // .data.tokens.accessToken // .token // empty'
)
[ -n "$TOKEN" ] || { echo "FAIL: não obteve token do afiliador"; exit 1; }

curl -fsS -H "Authorization: Bearer $TOKEN" "$BASE/api/affiliates/stats" | jq .

echo -e "\n== DB: últimos vínculos em affiliate_referrals (top 5) =="
psql "$DBURL_CLEAN" -X -A -F $'\t' -c "
SELECT u.email, ar.parent_user_id, ar.child_user_id, ar.\"createdAt\"
FROM public.affiliate_referrals ar
JOIN public.users u ON u.id::uuid = ar.child_user_id
ORDER BY ar.\"createdAt\" DESC
LIMIT 5;
"

echo -e "\n✅ OK: guard finalizado."
