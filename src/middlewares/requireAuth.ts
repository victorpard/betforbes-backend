import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type UserPayload = {
  id: string;
  email?: string;
  role?: string;
  name?: string;
  isVerified?: boolean;
};

/** Tenta verificar com HS256 usando JWT_ACCESS_SECRET e JWT_SECRET (nessa ordem). */
function tryHS256(token: string): JwtPayload | null {
  const secrets = [process.env.JWT_ACCESS_SECRET, process.env.JWT_SECRET].filter(Boolean) as string[];
  for (const sec of secrets) {
    try {
      return jwt.verify(token, sec, { algorithms: ['HS256'] }) as JwtPayload;
    } catch {
      /* tenta o próximo */
    }
  }
  return null;
}

/** Tenta verificar com RS256 usando JWT_PUBLIC_KEY (texto PEM ou base64). */
function tryRS256(token: string): JwtPayload | null {
  const pub = process.env.JWT_PUBLIC_KEY;
  if (!pub) return null;
  const key = pub.includes('BEGIN PUBLIC KEY') ? pub : Buffer.from(pub, 'base64').toString('utf8');
  try {
    return jwt.verify(token, key, { algorithms: ['RS256'] }) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Header Authorization: Bearer <token>
  const hdr = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  const bearer = hdr && hdr.toLowerCase().startsWith('bearer ') ? hdr.slice(7).trim() : undefined;

  // Aceita também cookie/query para fluxos web atrás do nginx, se existirem
  const cookieTok = (req as any).cookies?.access_token || (req as any).cookies?.token;
  const queryTok = typeof req.query?.access_token === 'string' ? (req.query.access_token as string) : undefined;

  const token = bearer || cookieTok || queryTok;
  if (!token) return res.status(401).json({ success: false, error: 'Missing Bearer token' });

  // Verificação em cascata: HS256 → RS256
  let payload = tryHS256(token) || tryRS256(token);
  if (!payload) return res.status(401).json({ success: false, error: 'Invalid or expired token' });

  // Normaliza possíveis claims: sub | userId | id
  const id =
    String((payload as any).sub ?? (payload as any).userId ?? (payload as any).id ?? '').trim();

  if (!id) return res.status(401).json({ success: false, error: 'Invalid or expired token' });

  const user: UserPayload = {
    id,
    email: (payload as any).email ?? '',
    role: (payload as any).role ?? 'USER',
    name: (payload as any).name ?? '',
    isVerified: Boolean((payload as any).isVerified),
  };

  // Contextos de compatibilidade usados em partes diferentes do projeto
  (req as any).user = user;                     // padrão atual
  (req as any).userId = id;                     // compat: código que lê req.userId
  (req as any).auth = { userId: id, ...user };  // compat: código que lê req.auth.userId
  (res.locals as any).user = user;              // opcional: acesso em views/handlers

  return next();
}
