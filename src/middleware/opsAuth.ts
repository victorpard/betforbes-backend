import { Request, Response, NextFunction } from 'express';
const HEADER = 'x-ops-token';
export function opsAuth(req: Request, res: Response, next: NextFunction) {
  const cfg = process.env.OPS_METRICS_TOKEN?.trim();
  if (!cfg) return res.status(500).json({ error: 'OPS token not configured' });
  const got = String(req.headers[HEADER] || '').trim();
  if (!got || got !== cfg) return res.status(401).json({ error: 'Unauthorized (OPS)' });
  (req as any).opsScope = 'read_only_metrics';
  next();
}
