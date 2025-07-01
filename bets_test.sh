#!/usr/bin/env bash

# Seu token JWT (já sem <> nem texto extra)
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMTJiYjg1Yy03NTE5LTRmODYtOTRhMS03ZmNjODQ2YTU3OWQiLCJlbWFpbCI6InVzdWFyaW90ZXN0ZUBiZXRmb3JiZXMuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTEyOTYzMjQsImV4cCI6MTc1MTI5NzIyNH0.8wQC3CHH5qz6K-Uul2TT1308RufmML1udoLNCdtWQDo"

echo "1) Criando ordem de aposta (BTC-USDT, market, 50 USDT, 20x LONG)..."
curl -s -X POST http://localhost:3001/api/bets \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "BTC-USDT",
    "type": "market",
    "amount": 50,
    "leverage": 20,
    "direction": "LONG"
  }' | jq

echo -e "\n2) Listando todas as apostas do usuário..."
curl -s -X GET http://localhost:3001/api/bets \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq

# Defina aqui o ID da ordem que deseja fechar (pegue da lista acima)
ORDER_ID_TO_CLOSE="808b3002-7fd7-448e-aefb-e2d8a60e9c17"

echo -e "\n3) Fechando a ordem $ORDER_ID_TO_CLOSE..."
curl -s -X POST http://localhost:3001/api/bets/$ORDER_ID_TO_CLOSE/close \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq

echo -e "\n4) Listando todas as apostas novamente para ver status atualizado..."
curl -s -X GET http://localhost:3001/api/bets \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
