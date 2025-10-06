import profileAdapter from './patch/profileAdapter';
import userRoutes from './modules/users/user.routes';
import healthRouter from './routes/health.routes';
// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import opsRouter from './routes/ops.route';
import metricsTestRoutes from './routes/metricsTestRoutes';
import debugRouter from './routes/debug.routes';
import apiRouter from './routes';

import { requireAuth } from './middlewares/requireAuth';
/** Healthchecks completos (inclui /health, /healthz, /api/health, /api/healthz) */

import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { referralCookie } from './middlewares/referralCookie';
import { normalizeAuthHeader } from './middlewares/normalizeAuthHeader';
import { idemMiddleware } from './middlewares/idempotency';

import ordersRouter from './modules/orders/orders.router';
import { affiliateMetricsRouter } from './modules/affiliate/metrics.module';

import prisma from './lib/prisma';

const app = express();
app.use('/api', profileAdapter);
app.use('/api/auth', userRoutes);
/** Healthchecks completos (inclui /health, /healthz, /api/health, /api/healthz) */
app.use('/', healthRouter);
app.use('/api', healthRouter);

/** Não expor X-Powered-By */
app.disable('x-powered-by');

/**
 * trust proxy:
 * - default: 1 (Nginx único)
 * - aceita: "true" | "false" | número (ex: "2")
 */
(function configureTrustProxy() {
  const raw = process.env.TRUST_PROXY;
  let val: boolean | number = 1;
  if (raw === 'true') val = true;
  else if (raw === 'false') val = false;
  else if (raw && Number.isFinite(Number(raw))) val = Number(raw);
  app.set('trust proxy', val);
})();

/** Helmet — HSTS desligado (controlado no edge) */
app.use(
  helmet({
    hsts: false,
    frameguard: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

/** CORS (libera Authorization + cookies) */
const ENV_ALLOWED =
  process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) ?? [];

const ALLOWED_ORIGINS = Array.from(
  new Set([
    ...ENV_ALLOWED,
    (process.env.FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, ''),
    'https://betforbes.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ])
);

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman
    cb(null, ALLOWED_ORIGINS.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Idempotency-Key',
    'X-Dry-Run',
    'X-OPS-TOKEN',
  ],
  exposedHeaders: [
    'ETag',
    'RateLimit-Limit',
    'RateLimit-Remaining',
    'RateLimit-Reset',
    'Request-Id',
    'Idempotency-Key',
    'Idempotency-Status',
    'Retry-After',
  ],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/** Body parsers */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

/** Cookies (para referral HttpOnly) */
app.use(cookieParser());

/** Rota curta de referral (vem ANTES do /api e do 404) */
app.all('/r/:code', (req: Request, res: Response) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.sendStatus(405);
  }
  const raw = String(req.params.code || '').trim();
  const code = raw.toUpperCase();

  // 🔧 Ajuste necessário: alinhar o nome do cookie com os handlers (referral_code)
  res.cookie('referral_code', code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  });

  const frontend = (process.env.FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, '');
  return res.redirect(302, `${frontend}/cadastro?ref=${encodeURIComponent(code)}`);
});

/** Captura ?ref= e salva cookie HttpOnly (middleware) */
app.use(referralCookie);

/** Request-Id + X-Frame-Options (antes do logger) */
app.use((req: Request, res: Response, next: NextFunction) => {
  const rid =
    req.get('x-request-id') ||
    (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
  res.set('Request-Id', rid);
  if (!res.get('X-Frame-Options')) res.set('X-Frame-Options', 'DENY');
  next();
});

/** Logger com token para Idempotency-Status */
morgan.token('idem', (_req, res) => String(res.getHeader('Idempotency-Status') || ''));
morgan.token('rid', (_req, res) => String(res.getHeader('Request-Id') || ''));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms rid=:rid idem=:idem'));

/** Healthchecks (isentos de rate limit) — GET e HEAD; com ping no DB */
async function healthHandler(_req: Request, res: Response) {
  const t0 = process.hrtime.bigint();
  let db = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'ok';
  } catch {
    db = 'down';
  }
  const dbMs = Number((process.hrtime.bigint() - t0) / BigInt(1_000_000));
  const ok = db === 'ok';

  if (_req.method === 'HEAD') {
    return res.status(ok ? 200 : 503).end();
  }

  return res.status(ok ? 200 : 503).json({
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
}
app.get('/health', healthHandler);
app.head('/health', healthHandler);
app.get('/healthz', healthHandler);
app.head('/healthz', healthHandler);
app.get('/api/health', healthHandler);
app.head('/api/health', healthHandler);
app.get('/api/healthz', healthHandler);
app.head('/api/healthz', healthHandler);

/**
 * Endpoints de debug — montar ANTES de rateLimiter/apiRouter.
 */
app.use('/api/_debug', debugRouter);

/** Normaliza Authorization: Bearer <token> em TODA a API (antes do rate limit) */
app.use('/api', normalizeAuthHeader);

/** Rate limit global */
app.use(rateLimiter);

/** Idempotência — antes das rotas mutantes (ex.: orders) */
app.use(idemMiddleware);

/** /api/auth/profile (protegido) */
app.get('/api/auth/profile', requireAuth, (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, message: 'OK', data: null });
});

/** Rotas de orders (preview/create) */
app.use('/api/orders', ordersRouter);

/** Métricas de afiliados (protegido) */
app.use('/api/affiliate', requireAuth, affiliateMetricsRouter);

/** Rotas de métricas de teste */
app.use('/api', metricsTestRoutes);

/** Ops e API */
app.use('/api/ops', opsRouter);
app.use('/api', apiRouter);

/** 404 genérico (antes do errorHandler) */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

/** Handler de erros (sempre por último) */
app.use(errorHandler);

export default app;
