"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../lib/prisma"));
const errorHandler_1 = require("../../middlewares/errorHandler");
class AffiliateService {
    /**
     * Obter link único do usuário
     */
    async getReferralLink(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { referralCode: true }
        });
        if (!user || !user.referralCode) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado ou código de referência não disponível', 404, 'USER_NOT_FOUND');
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
    async getAffiliateStats(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { referralCode: true }
        });
        if (!user || !user.referralCode) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        // Contar total de referrals
        const totalReferrals = await prisma_1.default.user.count({
            where: { referredBy: userId }
        });
        // Contar referrals ativos (verificados)
        const activeReferrals = await prisma_1.default.user.count({
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
    async getReferrals(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [referrals, total] = await Promise.all([
            prisma_1.default.user.findMany({
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
            prisma_1.default.user.count({
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
exports.default = new AffiliateService();
