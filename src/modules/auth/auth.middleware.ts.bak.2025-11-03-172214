import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayloadLike {
  userId?: string;
  id?: string;
  sub?: string;
  [key: string]: any;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: "Token ausente" });
  }
  const token = (m && m[1]) ? m[1].trim() : "";
  try {
    const secret = process.env.JWT_SECRET || "";
    if (!secret) {
      return res.status(500).json({ success: false, message: "JWT_SECRET não configurado" });
    }
    const payload = jwt.verify(token, secret) as JwtPayloadLike;
    const userId = payload.userId || payload.id || payload.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Token inválido (sem userId)" });
    }
    (req as any).user = { userId };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token inválido ou expirado" });
  }
};

export default authMiddleware;
