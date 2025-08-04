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
    /**
     * Obter perfil do usuário
     */
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
    /**
     * Atualizar perfil do usuário
     */
    async updateProfile(userId, updateData) {
        const { name, phone, birthDate } = updateData;
        // Preparar dados para atualização
        const dataToUpdate = {};
        if (name !== undefined)
            dataToUpdate.name = name;
        if (phone !== undefined)
            dataToUpdate.phone = phone;
        if (birthDate !== undefined) {
            dataToUpdate.birthDate = birthDate ? new Date(birthDate) : null;
        }
        // Verificar se há dados para atualizar
        if (Object.keys(dataToUpdate).length === 0) {
            throw (0, errorHandler_1.createError)('Nenhum dado fornecido para atualização', 400, 'NO_DATA_TO_UPDATE');
        }
        // Atualizar usuário
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
    /**
     * Alterar senha do usuário
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Buscar usuário
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        // Verificar senha atual
        const isCurrentPasswordValid = await (0, helpers_1.verifyPassword)(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw (0, errorHandler_1.createError)('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
        }
        // Verificar se a nova senha é diferente da atual
        const isSamePassword = await (0, helpers_1.verifyPassword)(newPassword, user.password);
        if (isSamePassword) {
            throw (0, errorHandler_1.createError)('A nova senha deve ser diferente da senha atual', 400, 'SAME_PASSWORD');
        }
        // Hash da nova senha
        const hashedNewPassword = await (0, helpers_1.hashPassword)(newPassword);
        // Atualizar senha
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        // Invalidar todas as sessões do usuário (forçar novo login)
        await prisma_1.default.userSession.updateMany({
            where: { userId },
            data: { isActive: false },
        });
        logger_1.logger.info(`🔑 Senha alterada: ${user.email}`);
        return { success: true };
    }
    /**
     * Listar sessões ativas do usuário
     */
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
    /**
     * Revogar sessão específica
     */
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
    /**
     * Revogar todas as sessões (exceto a atual)
     */
    async revokeAllSessions(userId, currentToken) {
        let whereClause = {
            userId,
            isActive: true,
        };
        // Se há um token atual, excluir essa sessão da revogação
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
    /**
     * Excluir conta do usuário
     */
    async deleteAccount(userId, password) {
        // Buscar usuário
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        // Verificar senha
        const isPasswordValid = await (0, helpers_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)('Senha incorreta', 400, 'INVALID_PASSWORD');
        }
        // Excluir usuário (cascade irá remover relacionamentos)
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        logger_1.logger.info(`🗑️  Conta excluída: ${user.email}`);
        return { success: true };
    }
    /**
     * Obter estatísticas do usuário
     */
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
        // Contar sessões ativas
        const activeSessions = await prisma_1.default.userSession.count({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() },
            },
        });
        // Calcular dias desde o registro
        const daysSinceRegistration = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return {
            userId: user.id,
            balance: parseFloat(user.balance.toString()),
            daysSinceRegistration,
            lastLoginAt: user.lastLoginAt,
            activeSessions,
            // Campos preparados para expansão futura
            totalBets: 0,
            totalWins: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
        };
    }
    /**
     * Verificar se usuário pode ser excluído
     */
    async canDeleteAccount(userId) {
        const reasons = [];
        // Verificar saldo
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { balance: true },
        });
        if (user && parseFloat(user.balance.toString()) > 0) {
            reasons.push('Usuário possui saldo em conta');
        }
        // Futuras verificações podem ser adicionadas aqui:
        // - Apostas pendentes
        // - Transações em processamento
        // - Disputas abertas
        return {
            canDelete: reasons.length === 0,
            reasons,
        };
    }
}
exports.default = new UserService();
