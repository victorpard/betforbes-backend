import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import normalizeAuthHeader from '../middlewares/normalizeAuthHeader';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

// todas as rotas exigem Bearer e normalização do header
router.use(normalizeAuthHeader, requireAuth);

/**
 * GET /api/affiliates/referrals?page=1&limit=50
 * Saída compatível com a UI atual:
 *   { items: Array<{ id,email,name?,isVerified?,createdAt }>, total, page, limit }
 */
router.get('/referrals', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = (req as any).user;
    const parentId: string = tokenUser?.userId;
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '50'), 10)));
    const offset = (page - 1) * limit;

    // --- UUID=UUID em JOIN e WHERE ---
    const rows = await prisma.$queryRaw<
      { child_id: string; child_email: string; child_name: string | null; child_isVerified: boolean; createdAt: Date }[]
    >`
      SELECT
        ar.child_user_id               AS child_id,
        c.email                        AS child_email,
        c.name                         AS child_name,
        c."isVerified"                 AS child_isVerified,
        ar."createdAt"                 AS "createdAt"
      FROM public.affiliate_referrals ar
      JOIN public.users c
        ON c.id = ar.child_user_id
      WHERE ar.parent_user_id = ${parentId}::uuid
      ORDER BY ar."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset};
    `;

    const totalRow = await prisma.$queryRaw<{ cnt: number }[]>`
      SELECT COUNT(*)::int AS cnt
      FROM public.affiliate_referrals ar
      WHERE ar.parent_user_id = ${parentId}::uuid;
    `;
    const total = totalRow?.[0]?.cnt ?? 0;

    const items = (rows || []).map(r => ({
      id: r.child_id,
      email: r.child_email,
      name: r.child_name ?? null,
      isVerified: !!r.child_isVerified,
      createdAt: r.createdAt,
    }));

    res.set('x-aff-router', 'alias-v2');
    return res.json({
      success: true,
      message: "Lista de afiliados obtida com sucesso",
      data: { items, total, page, limit },
      // retrocompat para UIs antigas:
      items, total, page, limit
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/affiliates/stats
 * Saída:
 *  { success:true, data:{ totalReferrals, activeReferrals, totalEarnings, referralLink } }
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokenUser = (req as any).user;
    const parentId: string = tokenUser?.userId;

    const totalRow = await prisma.$queryRaw<{ cnt: number }[]>`
      SELECT COUNT(*)::int AS cnt
      FROM public.affiliate_referrals ar
      WHERE ar.parent_user_id = ${parentId}::uuid;
    `;
    const totalReferrals = totalRow?.[0]?.cnt ?? 0;

    // (placeholder) Ativos e ganhos
    const activeReferrals = 0;
    const totalEarnings = 0;

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
      data: { totalReferrals, activeReferrals, totalEarnings, referralLink }
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
