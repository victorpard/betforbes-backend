#!/usr/bin/env bash
#
# dev.sh — mata o processo em 3001 (se existir) e sobe o npm run dev

# encontra o PID que está escutando na porta 3001
PID=$(lsof -t -i:3001)

# se não estiver vazio, mata o processo
if [ -n "$PID" ]; then
  echo "Matando processo na porta 3001 (PID $PID)…"
  kill -9 $PID
fi

# inicia o servidor em modo dev
echo "Subindo o servidor (npm run dev)…"
npm run dev
