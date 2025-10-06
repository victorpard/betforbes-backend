// src/routes/ops.route.ts
import { Router, Request, Response, NextFunction } from 'express';
import { opsAuth } from '../middleware/opsAuth';
import funnelRoutes from './ops.funnel.route';
import opsMetricsRoutes from './ops.metrics.route';
import prisma from '../lib/prisma';
import { microcache } from '../middlewares/microcache';

const router = Router();

// Health do namespace OPS
router.get('/healthz', (_req: Request, res: Response) => {
  res.json({ ok: true, scope: 'ops', ts: new Date().toISOString() });
});

// Exige X-OPS-Token e monta as rotas de funil/métricas (somente leitura)
router.use(opsAuth, funnelRoutes);
router.use(opsAuth, opsMetricsRoutes);

// ---- Lazy require de CSV (à prova de boot) ----
let stringifyCsv: ((rows: any[], opts: any) => string) | null = null;
function ensureCsvLib() {
  if (!stringifyCsv) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('csv-stringify/sync');
    stringifyCsv = (mod.stringify ?? mod.default ?? mod) as (rows: any[], opts: any) => string;
  }
}

// Util: converte "30d", "7d", "12h", "90m" para um intervalo [start, end)
function parseRange(range: string) {
  const m = String(range || '30d').match(/^(\d+)([dhm])$/i);
  const now = new Date();
  const end = now;
  const start = new Date(now);
  if (!m) {
    start.setDate(start.getDate() - 30);
    return { start, end };
  }
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 'd') start.setDate(start.getDate() - n);
  else if (unit === 'h') start.setHours(start.getHours() - n);
  else if (unit === 'm') start.setMinutes(start.getMinutes() - n);
  else start.setDate(start.getDate() - 30);
  return { start, end };
}

// --- Relatório (CSV/JSON) de afiliados: ref_linked no período ---
// Suporta AMBOS os caminhos para evitar 502 do nginx com extensão:
//   - GET /api/ops/affiliates/report.csv?range=30d[&tz=America/Sao_Paulo][&origin=cookie|code][&verified=true|false][&format=json]
//   - GET /api/ops/affiliates/report?range=30d[&tz=America/Sao_Paulo][&origin=cookie|code][&verified=true|false][&format=csv|json]
router.get(
  ['/affiliates/report.csv', '/affiliates/report'],
  opsAuth, microcache({ ttlMs: 60000, key: (req: Request) => `ops:affiliates:report:` }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const range = String(req.query.range || '30d');
      const tz = String(req.query.tz || 'America/Sao_Paulo');
      const format = String(req.query.format || 'csv').toLowerCase();
      const originFilter =
        req.query.origin ? String(req.query.origin).toLowerCase() : null;
      const verifiedFilter =
        typeof req.query.verified === 'string'
          ? /^true$/i.test(String(req.query.verified))
            ? true
            : /^false$/i.test(String(req.query.verified))
            ? false
            : null
          : null;

      const { start, end } = parseRange(range);

      const rows = await prisma.$queryRawUnsafe<any[]>(
        `
        WITH ref_events AS (
          SELECT
            fe."id",
            timezone($3, fe."createdAt") AS linked_at_local,
            fe."userId"::text        AS user_id_txt,
            fe."affiliateId"::text   AS affiliate_id_txt,
            fe."origin"              AS origin
          FROM "FunnelEvent" fe
          WHERE fe."kind" = 'ref_linked'
            AND fe."createdAt" >= $1
            AND fe."createdAt" <  $2
            AND ($4::text IS NULL OR fe."origin" = $4::text)
        ),
        users_map AS (
          SELECT id::text AS id_txt, email FROM "users"
        ),
        enriched AS (
          SELECT
            to_char(re.linked_at_local, 'YYYY-MM-DD"T"HH24:MI:SS') AS linked_at,
            re.user_id_txt                                        AS user_id,
            ue.email                                              AS user_email,
            re.affiliate_id_txt                                   AS affiliate_id,
            ae.email                                              AS affiliate_email,
            COALESCE(re.origin, '')                               AS origin,
            EXISTS (
              SELECT 1
              FROM "FunnelEvent" ev
              WHERE ev."kind" = 'email_verified'
                AND ev."userId" = re.user_id_txt
                AND ev."createdAt" < $2
            ) AS was_verified
          FROM ref_events re
          LEFT JOIN users_map ue ON ue.id_txt = re.user_id_txt
          LEFT JOIN users_map ae ON ae.id_txt = re.affiliate_id_txt
        )
        SELECT *
        FROM enriched e
        WHERE ($5::boolean IS NULL OR e.was_verified = $5::boolean)
        ORDER BY e.linked_at DESC;
        `,
        start,
        end,
        tz,
        originFilter,
        verifiedFilter
      );

      const data = rows.map((r) => ({
        linked_at: r.linked_at,
        user_id: r.user_id || '',
        user_email: r.user_email || '',
        affiliate_id: r.affiliate_id || '',
        affiliate_email: r.affiliate_email || '',
        origin: r.origin || '',
        was_verified: !!r.was_verified,
      }));

      // JSON
      if (format === 'json') {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        return res.status(200).json({
          range,
          tz,
          filters: { origin: originFilter, verified: verifiedFilter },
          count: data.length,
          rows: data,
        });
      }

      // CSV
      ensureCsvLib();
      let csv: string;
      try {
        csv = stringifyCsv!(data, {
          header: true,
          columns: [
            'linked_at',
            'user_id',
            'user_email',
            'affiliate_id',
            'affiliate_email',
            'origin',
            'was_verified',
          ],
        });
      } catch (e) {
        return res
          .status(500)
          .json({ error: 'CSV stringify failed', detail: (e as Error)?.message });
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="affiliates_${range}.csv"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      return res.status(200).send(csv);
    } catch (err) {
      return next(err);
    }
  }
);

// --------- Compat helpers para métricas/summary legado ---------

// Procura o handler GET /metrics/summary dentro de um Router do Express
function findSummaryHandlerFromRouter(
  r: any
): ((req: any, res: any, next: any) => any) | null {
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
  } catch {
    /* no-op */
  }
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
  (req as any).auth = (req as any).auth || {
    method: 'ops-token',
    scopes: ['ops:read'],
  };
}

// Injeta Prisma singleton no req (evita criar clientes novos)
function injectPrisma(req: any) {
  (req as any).prisma = prisma;
}

router.get('/metrics/summary', opsAuth, microcache({ ttlMs: 3000, key: (req: Request) => `ops:metrics:summary:` }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.range) req.query.range = '30d';
      if (!req.query.tz) req.query.tz = 'America/Sao_Paulo';

      // CJS-friendly import do módulo de métricas
      let mod: any = null;
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod = require('../modules/affiliate/metrics.module');
      } catch {
        /* segue */
      }

      // 1) Tenta handlers exportados
      const fromExport =
        mod?.metricsSummaryHandler ||
        mod?.default ||
        mod?.metricsSummary ||
        mod?.summary;

      if (typeof fromExport === 'function') {
        injectAuthContext(req, res);
        injectPrisma(req);
        return fromExport(req, res, next);
      }

      // 2) Sem export: tenta achar o handler dentro do affiliateMetricsRouter
      const affiliateRouter = mod?.affiliateMetricsRouter;
      const found =
        affiliateRouter && findSummaryHandlerFromRouter(affiliateRouter);

      if (typeof found === 'function') {
        injectAuthContext(req, res);
        injectPrisma(req);
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

// --- ALERTAS DE MÉTRICAS (simples) ---
// Ex.: GET /api/ops/metrics/alerts?range=24h&min_signup_verify=0.3&min_verified_linked=0.8&min_volume=20
router.get('/metrics/alerts', opsAuth, microcache({ ttlMs: 3000, key: (req: Request) => `ops:metrics:alerts:` }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = String(req.query.range || '24h');
    const { start, end } = parseRange(range);

    const minSignupVerify =
      typeof req.query.min_signup_verify === 'string' ? Number(req.query.min_signup_verify) : 0.3;
    const minVerifiedLinked =
      typeof req.query.min_verified_linked === 'string' ? Number(req.query.min_verified_linked) : 0.8;
    const minVolume =
      typeof req.query.min_volume === 'string' ? Number(req.query.min_volume) : 20;

    const rows = await prisma.$queryRawUnsafe<Array<{ kind: string; qty: number }>>(
      `
      SELECT kind, COUNT(*)::int AS qty
      FROM "FunnelEvent"
      WHERE "createdAt" >= $1 AND "createdAt" < $2
        AND kind IN ('signup_created','email_verified','ref_linked')
      GROUP BY kind
      `,
      start, end
    );

    const map = Object.fromEntries(rows.map((r) => [r.kind, r.qty]));
    const signup = map['signup_created'] || 0;
    const verified = map['email_verified'] || 0;
    const linked = map['ref_linked'] || 0;

    const signupToVerified = signup > 0 ? verified / signup : 0;
    const verifiedToLinked = verified > 0 ? linked / verified : 0;
    const signupToLinked = signup > 0 ? linked / signup : 0;

    const alerts: Array<{ code: string; level: 'warn' | 'crit'; message: string; value: number; threshold: number }> = [];

    if (signup < minVolume) {
      alerts.push({
        code: 'low_volume',
        level: 'warn',
        message: `Volume baixo de signups no período (${signup} < ${minVolume})`,
        value: signup,
        threshold: minVolume,
      });
    }

    if (signup >= minVolume && signupToVerified < minSignupVerify) {
      alerts.push({
        code: 'low_signup_to_verified',
        level: 'crit',
        message: `Conversão signup→verified baixa (${(signupToVerified * 100).toFixed(1)}% < ${(minSignupVerify * 100).toFixed(0)}%)`,
        value: signupToVerified,
        threshold: minSignupVerify,
      });
    }

    if (verified > 0 && verifiedToLinked < minVerifiedLinked) {
      alerts.push({
        code: 'low_verified_to_linked',
        level: 'warn',
        message: `Conversão verified→linked baixa (${(verifiedToLinked * 100).toFixed(1)}% < ${(minVerifiedLinked * 100).toFixed(0)}%)`,
        value: verifiedToLinked,
        threshold: minVerifiedLinked,
      });
    }

    return res.json({
      range,
      counts: { signup_created: signup, email_verified: verified, ref_linked: linked },
      conversion: {
        signup_to_verified: signupToVerified,
        verified_to_linked: verifiedToLinked,
        signup_to_linked: signupToLinked,
      },
      thresholds: {
        min_signup_verify: minSignupVerify,
        min_verified_linked: minVerifiedLinked,
        min_volume: minVolume,
      },
      alerts,
      ok: alerts.length === 0,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
