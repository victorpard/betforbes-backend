import { Router } from 'express';
import { prisma } from '../lib/prisma';

const r = Router();

/**
 * GET /api/ops/funnel?range=30d
 * ranges aceitos: 30d | 90d | 365d (default: 30d)
 */
r.get('/funnel', async (req, res) => {
  const { range = '30d' } = req.query as any;
  const days = { '30d': 30, '90d': 90, '365d': 365 }[String(range)] ?? 30;
  const from = new Date(Date.now() - days * 24 * 3600 * 1000);

  const [signup, verified, linked] = await Promise.all([
    prisma.funnelEvent.count({ where: { kind: 'signup_created', createdAt: { gte: from } } }),
    prisma.funnelEvent.count({ where: { kind: 'email_verified', createdAt: { gte: from } } }),
    prisma.funnelEvent.count({ where: { kind: 'ref_linked', createdAt: { gte: from } } }),
  ]);

  const c1 = signup ? verified / signup : 0;
  const c2 = verified ? linked / verified : 0;
  const cFull = signup ? linked / signup : 0;

  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  res.json({
    range: String(range),
    counts: {
      signup_created: signup,
      email_verified: verified,
      ref_linked: linked,
    },
    conversion: {
      signup_to_verified: c1,
      verified_to_linked: c2,
      signup_to_linked: cFull,
    },
  });
});

export default r;
