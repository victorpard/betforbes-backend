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

// Conjunto de caracteres sem ambíguos (remove I, O, 1, 0)
const SAFE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomCode(len = 6) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += SAFE_CHARS[Math.floor(Math.random() * SAFE_CHARS.length)];
  }
  return out;
}

function getPublicBaseUrl() {
  return (process.env.FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, '');
}

async function generateUniqueReferralCode(): Promise<string> {
  // tenta tamanhos 6→8 com algumas tentativas por tamanho
  for (let len = 6; len <= 8; len++) {
    for (let i = 0; i < 10; i++) {
      const code = randomCode(len);
      const exists = await prisma.user.findFirst({
        where: { referralCode: code },
        select: { id: true },
      });
      if (!exists) return code;
    }
  }
  // fallback (muito improvável chegar aqui)
  return randomCode(10);
}

/**
 * Garante que o usuário possua referralCode; gera e salva se necessário.
 * Retorna o código vigente.
 */
async function ensureReferralCode(userId: string): Promise<string> {
  const found = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (!found) {
    throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
  }
  if (found.referralCode) return found.referralCode;

  // gera e tenta persistir (com algumas tentativas para evitar colisão única)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = await generateUniqueReferralCode();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return code;
    } catch (e) {
      // colisão de unique index → tenta novamente
    }
  }
  // última tentativa "forçada"
  const code = randomCode(10);
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return code;
}

class AffiliateService {
  /**
   * Obter link único do usuário (gera código se faltar)
   */
  async getReferralLink(userId: string): Promise<{ referralLink: string; referralCode: string }> {
    // Garante que exista um referralCode
    const referralCode = await ensureReferralCode(userId);

    const baseUrl = getPublicBaseUrl();
    // Usa /register (rota válida no app)
    const referralLink = `${baseUrl}/r/${referralCode}`;

    return { referralLink, referralCode };
  }

  /**
   * Obter estatísticas de afiliados
   */
  async getAffiliateStats(userId: string): Promise<AffiliateStats> {
    // Garante o código antes de montar o link
    const referralCode = await ensureReferralCode(userId);

    const [totalReferrals, activeReferrals] = await Promise.all([
      prisma.user.count({ where: { referredBy: userId } }),
      prisma.user.count({ where: { referredBy: userId, isVerified: true } }),
    ]);

    // Exemplo de cálculo (placeholder)
    const earningsPerReferral = 10;
    const totalEarnings = activeReferrals * earningsPerReferral;

    const baseUrl = getPublicBaseUrl();
    const referralLink = `${baseUrl}/r/${referralCode}`;

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings,
      referralLink,
    };
  }

  /**
   * Listar usuários referenciados
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
    const offset = (page - 1) * limit;

    const [referrals, total] = await Promise.all([
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
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where: { referredBy: userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { referrals, total, page, totalPages };
  }
}

export default new AffiliateService();
