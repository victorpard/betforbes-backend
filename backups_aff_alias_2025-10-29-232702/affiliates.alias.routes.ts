import { Router, Request, Response, NextFunction } from 'express';
import normalizeAuthHeader from '../middlewares/normalizeAuthHeader';
import requireAuth from '../middlewares/requireAuth';
import prisma from '../config/prisma';

// Helpers de paginação segura
function toInt(v: any, def: number, min = 1, max = 1000) {
  const n = Number.parseInt(String(v ?? ''), 10);
  if (Number.isNaN(n)) return def;
  return Math.min(Math.max(n, min), max);
}

const router = Router();

// Todas as rotas exigem Bearer (normalize + requireAuth)
router.use(normalizeAuthHeader, requireAuth);

/**
 * GET /api/affiliates/referrals
 * Retorna duas formas (para compatibilidade com UIs atuais e futuras):
 * 1) { items, total, page, limit }
 * 2) { parentId, count, data }
 */
router.get(
  '/referrals',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenUser = (req as any).user;
      const parentId: string = tokenUser.userId; // uuid no users.id

      const page = toInt(req.query.page, 1);
      const limit = toInt(req.query.limit, 50, 1, 200);
      const offset = (page - 1) * limit;

      // IMPORTANTE: comparar SEMPRE como texto para evitar uuid=text
      // users.id::text = ar.parent_user_id  (ar.* é TEXT)
      const rows = await prisma.$queryRaw<
        Array<{
          child_id: string;
          child_email: string;
          child_name: string | null;
          child_verified: boolean;
          created_at: Date;
        }>
      >`
        SELECT
          c.id::text                      AS child_id,
          c.email                         AS child_email,
          c.name                          AS child_name,
          c."isVerified"                  AS child_verified,
          ar."createdAt"                  AS created_at
        FROM affiliate_referrals ar
        JOIN users c
          ON c.id::text = ar.child_user_id
        WHERE ar.parent_user_id = ${parentId}::text
        ORDER BY ar."createdAt" DESC
        OFFSET ${offset} LIMIT ${limit};
      `;

      // total com mesmo critério (comparação em texto)
      const totalRow = await prisma.$queryRaw<Array<{ cnt: bigint | number }>>`
        SELECT COUNT(*)::bigint AS cnt
        FROM affiliate_referrals ar
        WHERE ar.parent_user_id = ${parentId}::text;
      `;
      const total =
        totalRow && totalRow[0]
          ? Number(totalRow[0].cnt as any)
          : 0;

      const items = (rows || []).map((r) => ({
        id: r.child_id,
        email: r.child_email,
        name: r.child_name,
        isVerified: r.child_verified,
        createdAt: r.created_at,
      }));

      // shape 1 (usado pela UI atual)
      const shape1 = { items, total, page, limit };

      // shape 2 (compat futuro)
      const shape2 = {
        parentId,
        count: items.length,
        data: items,
      };

      res.set("x-aff-router","alias-v1"); return res.json(shape1);
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * GET /api/affiliates/stats
 * Usa o mesmo critério de comparação (texto) e devolve counters.
 */
router.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenUser = (req as any).user;
      const parentId: string = tokenUser.userId;

      // totalReferrals
      const totalRow = await prisma.$queryRaw<Array<{ cnt: bigint | number }>>`
        SELECT COUNT(*)::bigint AS cnt
        FROM affiliate_referrals ar
        WHERE ar.parent_user_id = ${parentId}::text;
      `;
      const totalReferrals =
        totalRow && totalRow[0]
          ? Number(totalRow[0].cnt as any)
          : 0;

      // activeReferrals (placeholder = total por enquanto)
      const activeReferrals = totalReferrals;

      // totalEarnings (placeholder 0 por enquanto; integrar quando tivermos tabela de comissões)
      const totalEarnings = 0;

      // referralLink a partir do próprio código do usuário
      const me = await prisma.user.findUnique({
        where: { id: parentId },
        select: { referralCode: true },
      });
      const referralCode = me?.referralCode || '';
      const referralLink = `https://www.betforbes.com/cadastro?ref=${referralCode}`;

      return res.json({
        success: true,
        message: 'Estatísticas de afiliados obtidas com sucesso',
        data: { totalReferrals, activeReferrals, totalEarnings, referralLink },
      });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
