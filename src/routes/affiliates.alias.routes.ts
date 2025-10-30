import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import normalizeAuthHeader from '../middlewares/normalizeAuthHeader';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

// todas as rotas exigem Bearer e normalização do header
router.use(normalizeAuthHeader, requireAuth);

/**
 * GET /api/affiliates/referrals?page=1&limit=50
 * Saída: { items: [{ id,email,createdAt,isVerified }], total, page, limit }
 */
router.get('/referrals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = (req as any).user;
    const parentId: string = tokenUser?.userId;

    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit ?? '50'), 10)));
    const offset = (page - 1) * limit;

    // LEFT/RIGHT como texto para evitar operator does not exist: uuid = text
    const rows = await prisma.$queryRaw<
      { child_id: string; child_email: string; createdAt: Date; isVerified: boolean }[]
    >`
      SELECT
        ar.child_user_id::text               AS child_id,
        c.email                              AS child_email,
        c."isVerified"                       AS "isVerified",
        ar."createdAt"                       AS "createdAt"
      FROM affiliate_referrals ar
      JOIN users c
        ON c.id::text = ar.child_user_id::text
      WHERE ar.parent_user_id::text = ${parentId}::text
      ORDER BY ar."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const totalRow = await prisma.$queryRaw<{ cnt: number }[]>`
      SELECT COUNT(*)::int AS cnt
      FROM affiliate_referrals ar
      WHERE ar.parent_user_id::text = ${parentId}::text;
    `;

    const total = Array.isArray(totalRow) && totalRow[0]?.cnt ? totalRow[0].cnt : 0;

    const items = (rows ?? []).map((r) => ({
      id: r.child_id,
      email: r.child_email,
      createdAt: r.createdAt,
      isVerified: r.isVerified,
    }));

    res.set('x-aff-router', 'alias-v2');
    return res.json({
      success: true,
      message: "Lista de afiliados obtida com sucesso",
      data: { items, total, page, limit },
      /* retrocompatibilidade para UIs antigas */
      items, total, page, limit
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/affiliates/stats
 * Saída: { success:true, data:{ totalReferrals, activeReferrals, totalEarnings, referralLink } }
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = (req as any).user;
    const parentId: string = tokenUser?.userId;

    // total (fonte: affiliate_referrals)
    const totalRow = await prisma.$queryRaw<{ cnt: number }[]>`
      SELECT COUNT(*)::int AS cnt
      FROM affiliate_referrals ar
      WHERE ar.parent_user_id::text = ${parentId}::text;
    `;
    const totalReferrals = Array.isArray(totalRow) && totalRow[0]?.cnt ? totalRow[0].cnt : 0;

    // ATIVOS reais = verificados em `users` com referredBy = parentId (usar ORM para evitar cast/sintaxe no SQL cru)
    const activeReferrals = await prisma.user.count({
      where: {
        referredBy: (parentId as any),
        isVerified: true,
      },
    });

    // (placeholder) Ajustar quando a lógica de comissões estiver ativa
    const totalEarnings = 0;

    // monta referralLink a partir do referralCode do próprio usuário
    const me = await prisma.user.findUnique({
      where: { id: parentId },
      select: { referralCode: true },
    });
    const code = me?.referralCode || '';
    const frontend = process.env.FRONTEND_URL || 'https://www.betforbes.com';
    const referralLink = `${frontend}/cadastro?ref=${code}`;

    res.set('x-aff-router', 'alias-v2');
    return res.json({
      success: true,
      message: 'Estatísticas de afiliados obtidas com sucesso',
      data: { totalReferrals, activeReferrals, totalEarnings, referralLink },
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
