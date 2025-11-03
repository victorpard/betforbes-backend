import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Resposta leve para smoke checks e uptime monitors
 */
router.get('/', (_req, res) => {
  res.json({
    ok: true,
    name: 'betforbes-backend',
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  });
});

export default router;
