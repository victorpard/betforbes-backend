import { Request, Response, NextFunction } from 'express';
import JWTService from '../../lib/jwt';

function pickToken(req: Request): string | null {
  // Authorization (case-insensitive). Aceita "Bearer <t>" ou só "<t>"
  const header =
    (req.headers['authorization'] as string | undefined) ??
    (req.headers['Authorization'] as unknown as string | undefined);

  if (header && typeof header === 'string') {
    const parts = header.trim().split(/\s+/);
    if (parts.length === 2) {
      const [scheme, token] = parts as [string, string];
      if (/^Bearer$/i.test(scheme)) return token.trim();
    } else if (parts.length === 1) {
      const [single] = parts as [string];
      if (single) return single.trim();
    }
  }

  // x-access-token
  const xToken = req.headers['x-access-token'];
  if (typeof xToken === 'string' && xToken.trim()) return xToken.trim();

  // Cookies: accessToken / token
  try {
    const c: any = (req as any).cookies || {};
    if (c?.accessToken) return String(c.accessToken).trim();
    if (c?.token) return String(c.token).trim();
  } catch { /* ignore */ }

  // Query param ?token=
  const q = req.query?.token;
  if (typeof q === 'string' && q.trim()) return q.trim();

  return null;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    const payload = JWTService.verifyAccessToken(token);

    if (!payload || !('userId' in payload) || !payload.userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN',
      });
    }

    (req as any).user = {
      id: payload.userId,
      email: (payload as any).email,
      role: (payload as any).role ?? 'USER',
      jwt: payload,
    };

    return next();
  } catch (err: any) {
    console.error('❌ authMiddleware error:', err?.message || err);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
  }
}

export default authMiddleware;
