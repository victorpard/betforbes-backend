// src/utils/referral.ts
import { Request } from 'express';

function normalize(v: unknown): string | undefined {
  const s = String(v ?? '').trim();
  if (!s) return undefined;
  const low = s.toLowerCase();
  if (low === 'null' || low === 'undefined') return undefined;
  return s.toUpperCase(); // códigos de referência padronizados
}

/**
 * Prioridade: body > cookie (bf_ref) > query (?ref=)
 * Ignora string vazia e textos "null"/"undefined".
 */
export function getReferralFromRequest(req: Request): string | undefined {
  const fromBody   = normalize((req.body as any)?.referralCode);
  const fromCookie = normalize((req as any).cookies?.bf_ref);
  const fromQuery  = normalize((req.query as any)?.ref);
  return fromBody ?? fromCookie ?? fromQuery;
}
