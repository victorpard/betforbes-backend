import { Router, Request, Response, NextFunction } from 'express';
import { opsAuth } from '../middleware/opsAuth';

const router = Router();

// Health do namespace OPS
router.get('/healthz', (_req: Request, res: Response) => {
  res.json({ ok: true, scope: 'ops', ts: new Date().toISOString() });
});

// Procura o handler GET /metrics/summary dentro de um Router do Express
function findSummaryHandlerFromRouter(r: any): ((req: any, res: any, next: any) => any) | null {
  try {
    const stack = r?.stack || [];
    for (const layer of stack) {
      const route = layer?.route;
      if (!route) continue;
      const p = route?.path;
      const isSummaryPath =
        p === '/metrics/summary' ||
        (Array.isArray(p) && p.includes('/metrics/summary'));
      const isGet = route?.methods?.get === true;
      if (isSummaryPath && isGet) {
        const rstack = route.stack || [];
        const last = rstack[rstack.length - 1];
        const handle = last?.handle || last;
        if (typeof handle === 'function') return handle;
      }
    }
  } catch { /* no-op */ }
  return null;
}

// Injeta contexto de "usuário de serviço" (para handlers que exigem req.user/res.locals.user)
function injectAuthContext(req: any, res: any) {
  const svcUser = {
    id: 'OPS_SERVICE',
    role: 'ADMIN',
    email: 'ops@betforbes.com',
    authMethod: 'ops-token',
    scopes: ['ops:read'],
  };
  req.user = req.user || svcUser;
  (req as any).userId = (req as any).userId || svcUser.id;
  res.locals = res.locals || {};
  res.locals.user = res.locals.user || req.user;
  (req as any).auth = (req as any).auth || { method: 'ops-token', scopes: ['ops:read'] };
}

// Injeta Prisma singleton no req (evita travar abrindo clientes novos)
function injectPrisma(req: any) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client');
  const g: any = global as any;
  if (!g.__ops_prisma) g.__ops_prisma = new PrismaClient();
  (req as any).prisma = g.__ops_prisma;
}

router.get(
  '/metrics/summary',
  opsAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.range) req.query.range = '30d';
      if (!req.query.tz) req.query.tz = 'America/Sao_Paulo';

      // CJS-friendly import do módulo de métricas
      let mod: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod = require('../modules/affiliate/metrics.module');
      } catch { /* segue */ }

      // 1) Tenta handlers exportados
      const fromExport =
        mod?.metricsSummaryHandler ||
        mod?.default ||
        mod?.metricsSummary ||
        mod?.summary;

      if (typeof fromExport === 'function') {
        injectAuthContext(req, res);
        injectPrisma(req); // <<< Prisma singleton no req
        return fromExport(req, res, next);
      }

      // 2) Sem export: tenta achar o handler dentro do affiliateMetricsRouter
      const affiliateRouter = mod?.affiliateMetricsRouter;
      const found = affiliateRouter && findSummaryHandlerFromRouter(affiliateRouter);

      if (typeof found === 'function') {
        injectAuthContext(req, res);
        injectPrisma(req); // <<< Prisma singleton no req
        return found(req, res, next);
      }

      // 3) Não encontrou
      return res.status(501).json({
        error: 'Metrics handler not found',
        fix: [
          'Exportar no módulo de afiliado (ex.: export { summary as metricsSummaryHandler };)',
          'Ou garantir que affiliateMetricsRouter contenha GET /metrics/summary',
        ],
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
