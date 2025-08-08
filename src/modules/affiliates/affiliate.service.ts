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
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: Date;
}

class AffiliateService {
  /**
   * Obter link único do usuário
   */
  async getReferralLink(userId: string): Promise<{ referralLink: string; referralCode: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (!user || !user.referralCode) {
      throw createError('Usuário não encontrado ou código de referência não disponível', 404, 'USER_NOT_FOUND');
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://www.betforbes.com';
    const referralLink = `${baseUrl}/cadastro?ref=${user.referralCode}`;

    return {
      referralLink,
      referralCode: user.referralCode
    };
  }

  /**
   * Obter estatísticas de afiliados
   */
  async getAffiliateStats(userId: string): Promise<AffiliateStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (!user || !user.referralCode) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Contar total de referrals
    const totalReferrals = await prisma.user.count({
      where: { referredBy: userId }
    });

    // Contar referrals ativos (verificados)
    const activeReferrals = await prisma.user.count({
      where: { 
        referredBy: userId,
        isVerified: true 
      }
    });

    // Calcular ganhos (exemplo: R$ 10 por referral ativo)
    const earningsPerReferral = 10;
    const totalEarnings = activeReferrals * earningsPerReferral;

    const baseUrl = process.env.FRONTEND_URL || 'https://www.betforbes.com';
    const referralLink = `${baseUrl}/cadastro?ref=${user.referralCode}`;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      referralLink
    };
  }

  /**
   * Listar usuários referenciados
   */
  async getReferrals(userId: string, page: number = 1, limit: number = 10): Promise<{
    referrals: ReferralUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
      prisma.user.findMany({
        where: { referredBy: userId },
        select: {
          id: true,
          name: true,
          email: true,
          isVerified: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({
        where: { referredBy: userId }
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      referrals,
      total,
      page,
      totalPages
    };
  }
}

export default new AffiliateService();



