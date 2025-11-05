import { Router, Request, Response } from 'express';

const router = Router();

function getBaseUrl(): string {
  const raw = (process.env.FRONTEND_URL || 'https://www.betforbes.com').trim();
  return raw.replace(/\/+$/, '');
}

function getCookieDomain(): string | undefined {
  const d = (process.env.COOKIE_DOMAIN || '').trim();
  // Se não definido, não setamos "domain" explicitamente (fica host-only, mais seguro)
  return d || undefined;
}

/**
 * GET /api/referral/:code
 * - Seta bf_ref=<code> (90 dias, Secure, SameSite=Lax, Path=/, Domain=.betforbes.com se configurado)
 * - Redireciona para /cadastro?ref=<code> no FRONTEND_URL
 */
router.get('/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim();
  if (!code) return res.status(400).json({ error: 'referral code ausente' });

  const domain = getCookieDomain();
  const maxAgeMs = 90 * 24 * 60 * 60 * 1000; // 90 dias
  res.cookie('bf_ref', code, {
    domain,             // opcional; só usa se COOKIE_DOMAIN estiver setado (ex.: .betforbes.com)
    path: '/',
    httpOnly: false,    // visível no FE se precisarem ler
    secure: true,       // HTTPS only
    sameSite: 'lax',
    maxAge: maxAgeMs,
  });

  const target = `${getBaseUrl()}/cadastro?ref=${encodeURIComponent(code)}`;
  return res.redirect(302, target);
});

export default router;
