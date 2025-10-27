import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

type UserPayload = {
  id: string;
  email: string;
  role: string;
  name: string;
  isVerified: boolean;
};

function getVerifier() {
  const pub = process.env.JWT_PUBLIC_KEY;
  const sec = process.env.JWT_SECRET;

  if (pub && pub.trim() !== '') {
    const key = pub.includes('BEGIN PUBLIC KEY')
      ? pub
      : Buffer.from(pub, 'base64').toString('utf8');
    return { key, algorithms: ['RS256'] as jwt.Algorithm[] };
  }
  if (sec && sec.trim() !== '') {
    return { key: sec, algorithms: ['HS256'] as jwt.Algorithm[] };
  }
  throw new Error('JWT_PUBLIC_KEY ou JWT_SECRET precisam estar definidos');
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.header('authorization') || req.header('Authorization');
  const m = auth?.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing Bearer token' });
  }

  try {
    const { key, algorithms } = getVerifier();
    const payload = jwt.verify(token, key, { algorithms }) as JwtPayload & Partial<UserPayload>;

    // Normaliza campos comuns (usa sub como id se existir)
    const user: UserPayload = {
      id: String(payload.sub ?? (payload as any).id ?? ''),
      email: (payload as any).email ?? '',
      role: (payload as any).role ?? 'user',
      name: (payload as any).name ?? '',
      isVerified: Boolean((payload as any).isVerified),
    };

    (req as any).user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};
