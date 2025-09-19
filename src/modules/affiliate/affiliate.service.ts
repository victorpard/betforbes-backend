// src/modules/affiliate/affiliate.service.ts
import prisma from '../../lib/prisma';
import { createError } from '../../middlewares/errorHandler';

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  referralLink: string;
}

export interface ReferralUser {
  id: string;
  name: string | null;
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface CreateAffiliateResult {
  id: string;
  code: string;
  referralLink: string;
}

const BASE_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONTEND_BASE_URL ||
  process.env.PUBLIC_URL ||
  'https://www.betforbes.com';

function buildReferralLink(code: string) {
  // Padrão em produção: link curto
  return `${BASE_URL}/r/${code}`;
}

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  // fallback extremamente improvável
  return `R${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

async function ensureReferralCode(userId: string): Promise<string> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (u?.referralCode) return u.referralCode;

  const code = await generateUniqueCode();
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return code;
}

class AffiliateService {
  /**
   * Criar perfil de afiliado (compat com versão antiga).
   * No schema atual não há tabela `affiliate`, então tratamos o "perfil"
   * como a existência de um `referralCode` único no próprio usuário.
   */
  async createAffiliate(userId: string, code: string): Promise<CreateAffiliateResult> {
    // Verifica usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referralCode: true },
    });
    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Se já tem referralCode, emulamos "já possui perfil de afiliado"
    if (user.referralCode) {
      throw createError('Usuário já possui perfil de afiliado', 400, 'AFFILIATE_ALREADY_EXISTS');
    }

    const normalized = (code || '').trim().toUpperCase();
    if (!normalized || normalized.length < 4) {
      throw createError('Código de afiliado inválido', 400, 'INVALID_CODE');
    }

    // Unicidade do código entre usuários
    const dup = await prisma.user.findUnique({
      where: { referralCode: normalized },
      select: { id: true },
    });
    if (dup) {
      throw createError('Código de afiliado já está em uso', 400, 'CODE_ALREADY_EXISTS');
    }

    // Seta o código no usuário
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: normalized },
    });

    return {
      id: userId, // antes era affiliate.id; agora usamos o id do usuário
      code: normalized,
      referralLink: buildReferralLink(normalized),
    };
  }

  /**
   * Obter link único do usuário (compat com versão antiga).
   * Antes tentava `affiliate.code`; agora usamos `users.referralCode`.
   */
  async getReferralLink(userId: string): Promise<{ referralLink: string; referralCode: string }> {
    const code = await ensureReferralCode(userId);
    return {
      referralLink: buildReferralLink(code),
      referralCode: code,
    };
  }

  /**
   * Estatísticas do afiliado (compatível com shape antigo).
   * totalReferrals: count de users.referredBy = userId
   * activeReferrals: count dos verificados
   * totalEarnings: mantemos mesma lógica vista (10 por ativo)
   */
  async getAffiliateStats(userId: string): Promise<AffiliateStats> {
    const code = await ensureReferralCode(userId);

    const [totalReferrals, activeReferrals] = await Promise.all([
      prisma.user.count({ where: { referredBy: userId } }),
      prisma.user.count({ where: { referredBy: userId, isVerified: true } }),
    ]);

    const totalEarnings = activeReferrals * 10;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      referralLink: buildReferralLink(code),
    };
  }

  /**
   * Listar usuários referenciados (paginado) — compat com shape antigo.
   */
  async getReferrals(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    referrals: ReferralUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const take = Math.max(1, Math.min(limit, 100));
    const skip = Math.max(0, (page - 1) * take);

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        where: { referredBy: userId },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where: { referredBy: userId } }),
    ]);

    return {
      referrals: rows,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / take)),
    };
  }
}

export default new AffiliateService();
