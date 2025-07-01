"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../lib/prisma"));
const helpers_1 = require("../../utils/helpers");
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = require("../../utils/logger");
class UserService {
    async getProfile(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                isActive: true,
                avatar: true,
                phone: true,
                birthDate: true,
                balance: true,
                referralCode: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        return {
            ...user,
            balance: parseFloat(user.balance.toString()),
        };
    }
    async updateProfile(userId, updateData) {
        const { name, phone, birthDate } = updateData;
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (phone !== undefined)
            dataToUpdate.phone = phone;
        if (birthDate !== undefined) {
            dataToUpdate.birthDate = birthDate ? new Date(birthDate) : null;
        }
        if (Object.keys(dataToUpdate).length === 0) {
            throw (0, errorHandler_1.createError)('Nenhum dado fornecido para atualização', 400, 'NO_DATA_TO_UPDATE');
        }
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                isActive: true,
                avatar: true,
                phone: true,
                birthDate: true,
                balance: true,
                referralCode: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        logger_1.logger.info(`👤 Perfil atualizado: ${user.email}`);
        return {
            ...user,
            balance: parseFloat(user.balance.toString()),
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        const isCurrentPasswordValid = await (0, helpers_1.verifyPassword)(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw (0, errorHandler_1.createError)('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
        }
        const isSamePassword = await (0, helpers_1.verifyPassword)(newPassword, user.password);
        if (isSamePassword) {
            throw (0, errorHandler_1.createError)('A nova senha deve ser diferente da senha atual', 400, 'SAME_PASSWORD');
        }
        const hashedNewPassword = await (0, helpers_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        await prisma_1.default.userSession.updateMany({
            where: { userId },
            data: { isActive: false },
        });
        logger_1.logger.info(`🔑 Senha alterada: ${user.email}`);
        return { success: true };
    }
    async getSessions(userId) {
        const sessions = await prisma_1.default.userSession.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
            select: {
                id: true,
                userAgent: true,
                ipAddress: true,
                createdAt: true,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return sessions;
    }
    async revokeSession(userId, sessionId) {
        const session = await prisma_1.default.userSession.findFirst({
            where: {
                id: sessionId,
                userId,
                isActive: true,
            },
        });
        if (!session) {
            throw (0, errorHandler_1.createError)('Sessão não encontrada', 404, 'SESSION_NOT_FOUND');
        }
        await prisma_1.default.userSession.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
        logger_1.logger.info(`🔒 Sessão revogada: ${sessionId}`);
        return { success: true };
    }
    async revokeAllSessions(userId, currentToken) {
        let whereClause = {
            userId,
            isActive: true,
        };
        if (currentToken) {
            whereClause.token = { not: currentToken };
        }
        const result = await prisma_1.default.userSession.updateMany({
            where: whereClause,
            data: { isActive: false },
        });
        logger_1.logger.info(`🔒 ${result.count} sessões revogadas para usuário: ${userId}`);
        return result.count;
    }
    async deleteAccount(userId, password) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        const isPasswordValid = await (0, helpers_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)('Senha incorreta', 400, 'INVALID_PASSWORD');
        }
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        logger_1.logger.info(`🗑️  Conta excluída: ${user.email}`);
        return { success: true };
    }
    async getUserStats(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                createdAt: true,
                lastLoginAt: true,
                balance: true,
            },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        const activeSessions = await prisma_1.default.userSession.count({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
        });
        const daysSinceRegistration = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return {
            userId: user.id,
            balance: parseFloat(user.balance.toString()),
            daysSinceRegistration,
            lastLoginAt: user.lastLoginAt,
            activeSessions,
            totalBets: 0,
            totalWins: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
        };
    }
    async canDeleteAccount(userId) {
        const reasons = [];
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        if (user && parseFloat(user.balance.toString()) > 0) {
            reasons.push('Usuário possui saldo em conta');
        }
        return {
            canDelete: reasons.length === 0,
            reasons,
        };
    }
}
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map