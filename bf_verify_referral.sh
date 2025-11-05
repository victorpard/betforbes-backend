#!/usr/bin/env bash
# BetForbes — Verificação segura (SOMENTE-LEITURA) do fluxo de referral
# Não altera arquivos. Apenas imprime achados e suspeitas.
set -euo pipefail
cd /opt/betforbes/backend

say(){ echo -e "\n==> $*"; }

say "1) Prisma: conferir colunas/relacionamentos relevantes (UUID esperado)"
[ -f prisma/schema.prisma ] || { echo "❌ prisma/schema.prisma não encontrado"; exit 1; }

echo "-- Campos possivelmente relevantes --"
grep -nE 'referredBy|referr|affiliate|Referral|@relation|@id|@unique' prisma/schema.prisma || true

say "2) Checar se há algum campo TEXT onde deveria ser UUID (heurística)"
grep -nE 'referredBy\s*:\s*(String|text|TEXT)' prisma/schema.prisma || echo "OK: não achamos referredBy como String/TEXT"
grep -nE '(parent|child).*:\s*(String|text|TEXT)' prisma/schema.prisma || echo "OK: parent/child aparentam não ser String/TEXT"

say "3) Procurar no código padrões perigosos (usando refCode/referralCode em colunas UUID)"
echo "-- Usos de referredBy: "
grep -RIn --line-number --color=never "referredBy" src || true

echo "-- Criação de affiliate_referrals: "
grep -RIn --line-number --color=never -E 'affiliate[_]?referral' src || true

say "4) Procurar trechos do register (controller/service) para revisão visual"
echo "-- auth.controller.ts (linhas com 'register(' e arredores) --"
awk 'f{print} /register\s*\(/ {print; for(i=0;i<60;i++){getline; print} ; f=0}' src/modules/auth/auth.controller.ts 2>/dev/null || true

echo "-- auth.service.ts (linhas com 'register(' e arredores) --"
awk 'f{print} /register\s*\(/ {print; for(i=0;i<120;i++){getline; print} ; f=0}' src/modules/auth/auth.service.ts 2>/dev/null || true

say "5) Heurística: detectar se refCode/referralCode aparece do lado direito de referredBy"
grep -RIn --line-number --color=never -E 'referredBy\s*:\s*(refCode|referralCode|req\.query\.ref|req\.body\.refCode|body\.refCode)' src || echo "OK: não encontramos uso direto de refCode em referredBy"

say "6) Heurística: detectar se parentUserId/childUserId recebem refCode (em vez de UUID)"
grep -RIn --line-number --color=never -E '(parentUserId|childUserId|parent_user_id|child_user_id)\s*:\s*(refCode|referralCode|req\.query\.ref|body\.refCode)' src || echo "OK: não encontramos uso direto de refCode em parent/child"

say "7) Últimos erros no PM2 (para pegar a stack do 500 durante /auth/register?ref=)"
pm2 logs betforbes-backend --timestamp --lines 120 | tail -n 120 || true

say "8) Opcional: checar tipos sem gerar build (tsc --noEmit, se disponível)"
if command -v npx >/dev/null 2>&1; then
  ( npx tsc --version >/dev/null 2>&1 && npx tsc --noEmit ) || echo "Aviso: tsc --noEmit não executou limpo (pode ser normal se não houver tsconfig alinhado)."
else
  echo "npx/TypeScript não disponível — pulando tsc --noEmit."
fi

say "✅ Verificação concluída (nenhum arquivo foi alterado). Veja os avisos/suspeitas acima."
