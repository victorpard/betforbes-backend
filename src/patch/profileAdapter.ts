import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

function bearer(req: Request): string | null {
  const h = req.headers['authorization'];
  const v = Array.isArray(h) ? h[0] : (h || '');
  if (!v) return null;
  return v.startsWith('Bearer ') ? v.slice(7) : v;
}

async function profileHandler(req: Request, res: Response) {
  try {
    // 1) tenta pegar userId de middlewares existentes
    const anyReq = req as any;
    let userId: string | undefined =
      anyReq?.auth?.userId || anyReq?.user?.id || anyReq?.userId || anyReq?.user?.userId;

    // 2) fallback: decodifica o JWT manualmente
    if (!userId) {
      const token = bearer(req);
      if (!token) return res.status(401).json({ success: false, message: 'MISSING_BEARER', data: null });
      const secret = process.env.JWT_SECRET || process.env.JWT || '';
      if (!secret) return res.status(500).json({ success: false, message: 'JWT_SECRET_NOT_SET', data: null });
      const dec: any = jwt.verify(token, secret);
      userId = dec?.userId || dec?.sub;
      if (!userId) return res.status(401).json({ success: false, message: 'INVALID_TOKEN', data: null });
    }

    // 3) busca usuário
    const user: any = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        isVerified: true, isActive: true, avatar: true, phone: true, birthDate: true,
        balance: true, referralCode: true, createdAt: true, updatedAt: true, lastLoginAt: true,
        // Se quiser incluir o afiliado que indicou, descomente abaixo:
        // referredBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!user) return res.status(404).json({ success: false, message: 'USER_NOT_FOUND', data: null });

    // 4) normaliza balance para number (string/Decimal -> number)
    if (user.balance != null) {
      if (typeof user.balance === 'string') {
        const n = Number(user.balance);
        if (!Number.isNaN(n)) user.balance = n;
      } else if (typeof (user.balance as any)?.toNumber === 'function') {
        const n = (user.balance as any).toNumber();
        if (typeof n === 'number' && !Number.isNaN(n)) user.balance = n;
      }
    }

    return res.json({ success: true, message: 'OK', data: { user } });
  } catch (_e) {
    return res.status(401).json({ success: false, message: 'INVALID_TOKEN', data: null });
  }
}

// Registra as duas rotas usando o mesmo handler
router.get('/auth/profile', profileHandler);
router.get('/auth/me', profileHandler);

export default router;
