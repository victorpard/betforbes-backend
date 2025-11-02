import { Request, Response, NextFunction } from 'express';

export default function normalizeAuthHeader(req: Request, _res: Response, next: NextFunction) {
  const h = (req.headers['authorization'] as string) || (req.headers as any)['Authorization'];
  if (typeof h === 'string') {
    // Permite "Token xyz" virar "Bearer xyz"
    req.headers.authorization = h.replace(/^Token\s+/i, 'Bearer ');
  }
  next();
}
