import express from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger'; // adapte o path se estiver diferente

const app = express();
const prisma = new PrismaClient();

// middleware básico (se já tiver outros, mantenha)
app.use(express.json());

// rota de healthcheck
app.get('/healthz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: 'reachable', uptime: process.uptime() });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    res.status(503).json({ ok: false, db: 'unreachable', error: errMsg });
  }
});

// root amigável
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'API up', uptime: process.uptime() });
});

export default app;
