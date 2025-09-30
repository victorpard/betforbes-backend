import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

/** Assina JWT garantindo jwtid (jti) único */
export function signWithJti(
  payload: string | Buffer | object,
  secret: jwt.Secret,
  options: jwt.SignOptions = {}
) {
  const opts: jwt.SignOptions = { ...options, jwtid: (options as any)?.jwtid ?? randomUUID() };
  return jwt.sign(payload as any, secret, opts);
}
