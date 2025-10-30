import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

/**
 * Lista afiliados (filhos) de um parent.
 * - Usa req.userId por padrão
 * - Aceita ?parentId= ou ?parentEmail=
 * - Une users."referredBy" (ids em TEXT) + affiliate_referrals (UUID) com casts
 */
export async function listReferrals(req: Request, res: Response) {
  try {
    // @ts-ignore populado pelo requireAuth
const authUserId = ((req as any)?.user?.id as string | undefined) || ((req as any).userId as string | undefined);
    const parentIdQuery = (req.query.parentId as string | undefined)?.trim() || null;
    const parentEmail   = (req.query.parentEmail as string | undefined)?.trim() || null;

    const parentRow = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `
      SELECT id
      FROM users
      WHERE ($1::text IS NOT NULL AND id = $1::text)
         OR ($2::text IS NOT NULL AND lower(email) = lower($2::text))
         OR ($3::text IS NOT NULL AND id = $3::text)
      ORDER BY id
      LIMIT 1;
      `,
      authUserId ?? null,
      parentEmail,
      parentIdQuery
    );

    if (!Array.isArray(parentRow) || parentRow.length === 0 || !parentRow[0]?.id) {
      return res.status(404).json({ error: 'parent não encontrado' });
    }
    const parentIdText: string = String(parentRow[0].id);

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `
      WITH parent AS (SELECT $1::text AS id)
      SELECT
        u.id            AS child_id,
        u.email         AS child_email,
        u."createdAt"   AS relation_created_at,
        'users.referredBy'::text AS source
      FROM users u
      JOIN parent p ON u."referredBy" = p.id

      UNION ALL

      SELECT
        c.id            AS child_id,
        c.email         AS child_email,
        ar."createdAt"  AS relation_created_at,
        'affiliate_referrals'::text AS source
      FROM affiliate_referrals ar
      JOIN parent p ON ar.parent_user_id = p.id::uuid
      JOIN users c   ON c.id = ar.child_user_id::text

      ORDER BY relation_created_at DESC;
      `,
      parentIdText
    );

    const seen = new Set<string>();
    const data = rows.filter(r => {
      const k = String(r.child_id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).map(r => ({
      id: String(r.child_id),
      email: String(r.child_email),
      relationCreatedAt: r.relation_created_at ? new Date(r.relation_created_at) : null,
      source: String(r.source),
    }));

    return res.json({ parentId: parentIdText, count: data.length, data });
  } catch (e: any) {
    return res.status(500).json({ error: 'erro ao listar afiliados', detail: e?.message || String(e) });
  }
}
