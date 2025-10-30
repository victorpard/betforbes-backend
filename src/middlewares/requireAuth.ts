import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET: string = (process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'change-me');

export default function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m || !m[1]) return res.status(401).json({ error: 'missing bearer token' });

  const token: string = m[1];

  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as any;

    // Projetos Express com tipagem comum usam req.user
    // Mantemos compatibilidade e evitamos mudar tipos globais
    (req as any).user = {
      id: payload?.sub || payload?.userId || payload?.id,
      ...payload,
    };

    // Também deixamos no res.locals para handlers que leem de lá
    res.locals.userId = (req as any).user.id;

    if (!(req as any).user.id) {
      return res.status(401).json({ error: 'invalid token' });
    }

    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
