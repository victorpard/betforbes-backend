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

export interface CreateAffiliateResult {
  id: string;
  code: string;
  referralLink: string;
}

class AffiliateService {
  /**
   * Criar perfil de afiliado
   */
  async createAffiliate(userId: string, code: string): Promise<CreateAffiliateResult> {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar se já existe um afiliado para este usuário
    const existingAffiliate = await prisma.affiliate.findUnique({
      where: { userId }
    });

    if (existingAffiliate) {
      throw createError('Usuário já possui perfil de afiliado', 400, 'AFFILIATE_ALREADY_EXISTS');
    }

    // Verificar se o código já está em uso
    const existingCode = await prisma.affiliate.findUnique({
      where: { code }
    });

    if (existingCode) {
      throw createError('Código de afiliado já está em uso', 400, 'CODE_ALREADY_EXISTS');
    }

    // Criar o afiliado
    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        code,
        totalReferrals: 0,
        totalEarnings: 0
      }
    });

    // Gerar link de referência
    const baseUrl = process.env.FRONTEND_URL || 'https://www.betforbes.com';
    const referralLink = `${baseUrl}/cadastro?ref=${code}`;

    return {
      id: affiliate.id,
      code: affiliate.code,
      referralLink
    };
  }

  /**
   * Obter link único do usuário
   */
  async getReferralLink(userId: string): Promise<{ referralLink: string; referralCode: string }> {
    // Primeiro tentar buscar pelo afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      select: { code: true }
    });

    if (affiliate) {
      const baseUrl = process.env.FRONTEND_URL || 'https://www.betforbes.com';
      const referralLink = `${baseUrl}/cadastro?ref=${affiliate.code}`;

      return {
        referralLink,
        referralCode: affiliate.code
      };
    }

    // Fallback para o referralCode do usuário (compatibilidade)
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
    // Buscar afiliado
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      select: { 
        code: true,
        totalReferrals: true,
        totalEarnings: true
      }
    });

    if (!affiliate) {
      throw createError('Perfil de afiliado não encontrado', 404, 'AFFILIATE_NOT_FOUND');
    }

    // Contar total de referrals (usando a tabela ReferralConversion)
    const totalReferrals = await prisma.referralConversion.count({
      where: { affiliateId: userId }
    });

    // Contar referrals ativos (usuários verificados)
    const activeReferrals = await prisma.referralConversion.count({
      where: {
        affiliateId: userId,
        referredUser: {
          isVerified: true
        }
      }
    });

    // Usar os ganhos salvos no banco ou calcular
    const totalEarnings = affiliate.totalEarnings || (activeReferrals * 10);

    const baseUrl = process.env.FRONTEND_URL || 'https://www.betforbes.com';
    const referralLink = `${baseUrl}/cadastro?ref=${affiliate.code}`;

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

    // Buscar através da tabela ReferralConversion
    const [referralConversions, total] = await Promise.all([
      prisma.referralConversion.findMany({
        where: { affiliateId: userId },
        include: {
          referredUser: {
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.referralConversion.count({
        where: { affiliateId: userId }
      })
    ]);

    const referrals = referralConversions.map(conversion => conversion.referredUser);
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
