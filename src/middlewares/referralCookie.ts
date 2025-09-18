import type { Request, Response, NextFunction, CookieOptions } from 'express';

export const REF_COOKIE_NAME = 'bf_ref';
// Mesmo padrão do schema de registro: 6–12 chars, A–Z e 0–9
const REF_RE = /^[A-Z0-9]{6,12}$/;

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_DOMAIN: string | undefined =
  (process.env.COOKIE_DOMAIN || '').trim() || undefined;

/** Normaliza para STRING UPPERCASE ('' se vazio/indefinido). */
function norm(v: unknown): string {
  return (v ?? '').toString().trim().toUpperCase();
}

/** Retorna o código se válido; caso contrário, null. */
function normalizeValidCode(v: unknown): string | null {
  const code = norm(v);
  return REF_RE.test(code) ? code : null;
}

/** Opções base do cookie (construídas dinamicamente). */
function baseCookieOpts(): CookieOptions {
  const opts: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd, // Secure em produção (HTTPS atrás do Nginx)
    path: '/',
  };
  if (COOKIE_DOMAIN) opts.domain = COOKIE_DOMAIN; // só define Domain se existir no env
  return opts;
}

/** Opções completas para setar (inclui TTL de 30 dias). */
function setCookieOpts(): CookieOptions {
  return { ...baseCookieOpts(), maxAge: 30 * 24 * 60 * 60 * 1000 }; // 30 dias
}

/**
 * Middleware global que captura referral via:
 * - params:  /r/:code  (code ou ref)
 * - query:   ?ref=CODE (case-insensitive)
 * - headers: x-ref / x-ref-code / x-referral
 *
 * Se encontrar um código válido, grava o cookie HttpOnly e expõe
 * na mesma request em (req as any).__refFromMiddleware.
 */
export function referralCookie(req: Request, res: Response, next: NextFunction) {
  try {
    // params (/r/:code)
    const params: any = (req as any).params || {};
    const fromParams =
      normalizeValidCode(params.code) ??
      normalizeValidCode(params.ref);

    // query (?ref=)
    const q = (req.query as any)?.ref ?? (req.query as any)?.Ref ?? (req.query as any)?.REF;
    const fromQuery = normalizeValidCode(q);

    // headers (x-ref / x-ref-code / x-referral)
    const hdr = (req.headers['x-ref'] ||
                 req.headers['x-ref-code'] ||
                 req.headers['x-referral']) as string | undefined;
    const fromHeader = normalizeValidCode(hdr);

    // Prioridade: params -> query -> header
    const code = fromParams ?? fromQuery ?? fromHeader;

    if (code) {
      // Evita regravar se já é o mesmo valor
      const current = norm((req.cookies && (req.cookies as any)[REF_COOKIE_NAME]) || '');
      if (current !== code) {
        res.cookie(REF_COOKIE_NAME, code, setCookieOpts());
      }
      // Disponível na mesma request
      (req as any).__refFromMiddleware = code;
    }
  } catch {
    // no-op: nunca quebrar a request por causa de referral
  }
  next();
}

/**
 * Lê o referral de: body -> params -> query -> middleware -> headers -> cookie -> Referer (fallback)
 * Só considera valores VÁLIDOS (regex). Retorna null se nenhum válido.
 *
 * Observação: como só aceitamos códigos válidos, valores vazios ("") do body
 * NÃO sobrescrevem cookie/cabeçalho/param caso existam.
 */
export function getReferralFromRequest(req: Request): string | null {
  // body (cliente pode mandar referralCode/ref)
  const b1 = normalizeValidCode((req.body && (req.body as any).referralCode) || null);
  const b2 = normalizeValidCode((req.body && (req.body as any).ref) || null);

  // params (/r/:code)
  const params: any = (req as any).params || {};
  const p1 = normalizeValidCode(params.code);
  const p2 = normalizeValidCode(params.ref);

  // query (?ref=)
  const q = (req.query as any)?.ref ?? (req.query as any)?.Ref ?? (req.query as any)?.REF;
  const q1 = normalizeValidCode(q);

  // detectado pelo middleware nesta mesma request
  const mid = normalizeValidCode((req as any).__refFromMiddleware);

  // headers
  const hdr = (req.headers['x-ref'] ||
               req.headers['x-ref-code'] ||
               req.headers['x-referral']) as string | undefined;
  const h1 = normalizeValidCode(hdr);

  // cookie
  const c1 = normalizeValidCode((req.cookies && (req.cookies as any)[REF_COOKIE_NAME]) || null);

  // *** Fallback: extrair do Referer (ex.: /cadastro?ref=CODE ou /r/CODE) ***
  let r1: string | null = null;
  const refHdr = (req.headers.referer || req.headers.referrer) as string | undefined;
  if (refHdr) {
    try {
      const u = new URL(refHdr);
      // 1) ?ref=CODE
      r1 = normalizeValidCode(u.searchParams.get('ref'));
      // 2) /r/CODE (caso o referer seja a rota curta)
      if (!r1) {
        const m = u.pathname.match(/\/r\/([A-Za-z0-9]{6,12})(?:\/|$|\?)/);
        if (m?.[1]) r1 = normalizeValidCode(m[1]);
      }
    } catch {
      // ignora se URL inválida
    }
  }

  const candidates = [b1, b2, p1, p2, q1, mid, h1, c1, r1].filter(Boolean) as string[];

  // TS (com noUncheckedIndexedAccess) entende que candidates[0] pode ser undefined.
  // Use nullish coalescing para retornar string | null corretamente.
  const first = candidates[0];
  return first ?? null;
}

/** Limpa o cookie de referral (útil em logout, se desejar). */
export function clearReferralCookie(res: Response) {
  res.clearCookie(REF_COOKIE_NAME, baseCookieOpts());
}
