// src/middlewares/rateLimiter.ts
import { Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// Lê envs (com defaults seguros)
const WINDOW_SECONDS = (() => {
  const n = Number(process.env.RATE_LIMIT_WINDOW ?? 900); // 15min
  return Number.isFinite(n) && n > 0 ? n : 900;
})();

const MAX_REQ = (() => {
  const n = Number(process.env.RATE_LIMIT_MAX ?? 100);
  return Number.isFinite(n) && n > 0 ? n : 100;
})();

export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: WINDOW_SECONDS * 1000,
  max: MAX_REQ,
  standardHeaders: true,  // envia RateLimit-*
  legacyHeaders: false,   // não envia X-RateLimit-*
  // Gera chave SEM retornar undefined
  keyGenerator: (req: Request): string =>
    req.ip ||
    String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown'),

  // Handler tipado corretamente
  handler: (req: Request, res: Response): void => {
    const info = (req as any).rateLimit || {};
    const limit = info.limit ?? MAX_REQ;
    const remaining = Math.max(0, info.remaining ?? 0);
    const resetSec = info.resetTime
      ? Math.max(1, Math.ceil((info.resetTime.getTime() - Date.now()) / 1000))
      : WINDOW_SECONDS;

    // Cabeçalhos compatíveis com o que você já estava vendo em produção
    res.setHeader('ratelimit-policy', `${limit};w=${WINDOW_SECONDS}`);
    res.setHeader('ratelimit-limit', String(limit));
    res.setHeader('ratelimit-remaining', String(remaining));
    res.setHeader('ratelimit-reset', String(resetSec));

    res.status(429).json({
      success: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas requisições. Tente novamente em instantes.',
    });
  },
});
