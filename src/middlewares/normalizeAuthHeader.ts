// src/middlewares/normalizeAuthHeader.ts
import { Request, Response, NextFunction } from 'express';

export function normalizeAuthHeader(req: Request, _res: Response, next: NextFunction): void {
  // Pega o header cru (pode vir como array dependendo do proxy/cliente)
  let raw = req.headers['authorization'];
  if (Array.isArray(raw)) raw = raw[0];

  const header = typeof raw === 'string' ? raw.trim() : '';

  // Padrões aceitos (ex.: "Bearer <token>", "Token <token>", "authorization=Bearer <token>")
  const patterns = [
    /^bearer\s+(.+)$/i,
    /^token\s+(.+)$/i,
    /^authorization\s*=\s*bearer\s+(.+)$/i,
  ];

  let token: string | undefined;
  for (const re of patterns) {
    const m = re.exec(header);
    const candidate = m?.[1]?.trim();
    if (candidate) {
      token = candidate;
      break;
    }
  }

  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }

  next();
}
