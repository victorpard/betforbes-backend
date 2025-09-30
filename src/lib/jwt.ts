import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET as jwt.Secret;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as jwt.Secret;

type AnyPayload = Record<string, any>;

/**
 * Emite par de tokens com jti ÚNICO em CADA token (no payload).
 * Mantém expiração original (15m / 7d).
 */
export function issueTokenPair(payload: AnyPayload) {
  const accessToken  = jwt.sign({ ...payload, jti: randomUUID() }, JWT_SECRET,         { expiresIn: '15m' });
  const refreshToken = jwt.sign({ ...payload, jti: randomUUID() }, JWT_REFRESH_SECRET, { expiresIn: '7d'  });
  return { accessToken, refreshToken };
}

/**
 * Compat (default export) para locais que fazem `import jwtService from '../lib/jwt'`.
 * Inclui helpers esperados pelo middleware.
 */
const jwtService = {
  // wrappers síncronos
  sign: jwt.sign,
  verify: jwt.verify,
  decode: jwt.decode,

  // wrappers "async" compat (evitam TS2556 usando any)
  signAsync: async (...args: any[]) => (jwt.sign as any)(...args),
  verifyAsync: async (...args: any[]) => (jwt.verify as any)(...args),

  // helpers usados em src/middlewares/auth.ts
  extractTokenFromHeader(header?: string) {
    if (!header) throw new Error('Authorization header missing');
    const m = /^Bearer\s+(.+)$/i.exec(header.trim());
    if (!m) throw new Error('Invalid Authorization header');
    return m[1];
  },

  verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as AnyPayload;
  },

  verifyRefreshToken(token: string) {
    return jwt.verify(token, JWT_REFRESH_SECRET) as AnyPayload;
  },
};

export default jwtService;
