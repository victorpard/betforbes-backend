import rateLimit from 'express-rate-limit';
export const opsRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests (OPS)' },
});
