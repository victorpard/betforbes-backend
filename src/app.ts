// src/app.ts
import express, { Request, Response, NextFunction } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import apiRouter from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { referralCookie } from './middlewares/referralCookie';

const app = express();

/** Se roda atrás do Nginx/Proxy */
app.set('trust proxy', 1);

/** Desativa ETag para evitar 304/caching indevido na API */
app.set('etag', false);

/** Helmet (segurança básica) */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);

/** CORS (aceita Authorization + cookies) */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'https://www.betforbes.com',
  'https://betforbes.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl/postman
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['ETag', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/** Body parsers */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/** Cookies (necessário para o referral cookie HttpOnly) */
app.use(cookieParser());

/**
 * Rota curta de referral:
 * - Atende GET **e** HEAD (curl -I)
 * - Seta cookie HttpOnly "bf_ref" com o código
 * - Redireciona para /cadastro?ref=<CODE> no frontend
 *
 * IMPORTANTE: esta rota deve vir ANTES do mount do /api e do 404 handler.
 */
app.all('/r/:code', (req: Request, res: Response) => {
  // Aceita apenas GET e HEAD; demais => 405
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.sendStatus(405);
  }

  const raw = String(req.params.code || '').trim();
  const code = raw.toUpperCase();

  res.cookie('bf_ref', code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS em prod; permite teste local em HTTP
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
    path: '/', // todo o site
    domain: process.env.COOKIE_DOMAIN || undefined, // ex.: .betforbes.com em produção
  });

  const frontend = (process.env.FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, '');
  return res.redirect(302, `${frontend}/cadastro?ref=${encodeURIComponent(code)}`);
});

/** Captura ?ref= e salva cookie HttpOnly também (via middleware) */
app.use(referralCookie);

/** Logs */
app.use(morgan('tiny'));

/** Rate limit global */
app.use(rateLimiter);

/**
 * Guarda simples para /api/auth/profile (só verifica se veio Bearer; a
 * verificação real de token deve estar no middleware de auth da rota).
 */
app.use('/api/auth/profile', (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ success: false, code: 'UNAUTHORIZED' });
    return;
  }
  next();
});

/** Anti-cache para toda a API (evita 304/ETag e garante dados frescos por usuário) */
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Vary', 'Authorization');
  next();
});

/** Healthcheck rápido (público) */
app.get('/healthz', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

/** Todas as rotas da API ficam sob /api */
app.use('/api', apiRouter);

/** 404 para rotas não encontradas (antes do errorHandler) */
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

/** Handler de erros (sempre por último) */
app.use(errorHandler);

export default app;
