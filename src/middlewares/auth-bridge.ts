import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

/** Extrai token de Authorization, x-access-token, cookies e query (?token=) */
function pickToken(req: Request): string | null {
  const authz = (req.headers['authorization'] ?? req.headers['Authorization']) as
    | string
    | string[]
    | undefined;

  if (typeof authz === 'string') {
    const parts = authz.trim().split(/\s+/);
    if (parts.length === 2) {
      const scheme = parts[0];
      const token  = parts[1];
      if (typeof scheme === 'string' && /^Bearer$/i.test(scheme) && typeof token === 'string' && token) {
        return token.trim();
      }
    } else if (parts.length === 1) {
      const single = parts[0];
      if (typeof single === 'string' && single.trim()) return single.trim();
    }
  }

  const xTokRaw = req.headers['x-access-token'];
  if (typeof xTokRaw === 'string' && xTokRaw.trim()) return xTokRaw.trim();

  try {
    const c: any = (req as any).cookies || {};
    if (c?.accessToken) return String(c.accessToken).trim();
    if (c?.token)       return String(c.token).trim();
  } catch {}

  const q = (req.query as any)?.token;
  if (typeof q === 'string' && q.trim()) return q.trim();

  return null;
}

/** Verifica o token tentando múltiplos segredos conhecidos do ambiente. */
function verifyWithAnySecret(token: string): JwtPayload | null {
  const candidates = [
    process.env.JWT_SECRET,
    process.env.JWT_ACCESS_SECRET,
    process.env.ACCESS_TOKEN_SECRET,
  ].filter((s): s is string => typeof s === 'string' && !!s);

  for (const secret of candidates) {
    try {
      const payload = jwt.verify(token, secret) as JwtPayload;
      return payload || null;
    } catch {
      // tenta o próximo
    }
  }
  return null;
}

/** Middleware unificado/tolerante. Seta req.user = { id, email, role, jwt }. */
export function authBridge(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = pickToken(req);
    if (!raw) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'NO_TOKEN',
      });
    }

    const token = raw.replace(/^Bearer\s+/i, '').trim();
    const payload = verifyWithAnySecret(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN',
      });
    }

    const userId = (payload as any).userId ?? (payload as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido (sem userId)',
        code: 'INVALID_TOKEN_PAYLOAD',
      });
    }

    (req as any).user = {
      id: userId,
      email: (payload as any).email,
      role: (payload as any).role ?? 'USER',
      jwt: payload,
    };

    return next();
  } catch (err: any) {
    console.error('❌ authBridge error:', err?.message || err);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
  }
}

export default authBridge;
