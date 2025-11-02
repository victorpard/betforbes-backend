import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/health
router.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

export default router;
