#!/usr/bin/env bash
set -e

# Força TTY para PM2 funcionar
ssh -tt -o StrictHostKeyChecking=no root@84.247.129.103 << 'EOF2'
  cd /root/backend/betforbes_backend_modular
  git pull origin main
  npm install
  npm run build
  pm2 restart betforbes-backend || pm2 start npm --name betforbes-backend -- start
EOF2
