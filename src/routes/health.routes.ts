import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Atende GET e HEAD em /api/health e /api/healthz
router.get(['/health', '/healthz'], async (req, res) => {
  const t0 = process.hrtime.bigint();
  let db = 'unknown';
  try {
    // ping bem leve ao banco
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch {
    db = 'down';
  }
  const dbMs = Number((process.hrtime.bigint() - t0) / BigInt(1_000_000));

  const ok = db === 'ok';
  res.status(ok ? 200 : 503).json({
    success: ok,
    message: ok ? 'ok' : 'db down',
    data: {
      service: 'betforbes-backend',
      version: process.env.APP_VERSION || 'unknown',
      now: new Date().toISOString(),
      uptimeSec: Math.round(process.uptime()),
      db,
    },
    perf: { dbMs },
  });
});

export default router;
