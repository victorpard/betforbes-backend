"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("./user.service"));
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = require("../../utils/logger");
class UserController {
    /**
     * Obter perfil do usuário autenticado
     */
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            const user = await user_service_1.default.getProfile(userId);
            res.json({
                success: true,
                user,
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao obter perfil:', error);
            throw error;
        }
    }
    /**
     * Atualizar perfil do usuário
     */
    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const updateData = req.body;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            const user = await user_service_1.default.updateProfile(userId, updateData);
            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                user,
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    }
    /**
     * Alterar senha do usuário
     */
    async changePassword(req, res) {
        try {
            const userId = req.user?.id;
            const { currentPassword, newPassword } = req.body;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            await user_service_1.default.changePassword(userId, currentPassword, newPassword);
            res.json({
                success: true,
                message: 'Senha alterada com sucesso',
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao alterar senha:', error);
            throw error;
        }
    }
    /**
     * Listar sessões ativas do usuário
     */
    async getSessions(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            const sessions = await user_service_1.default.getSessions(userId);
            res.json({
                success: true,
                sessions,
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao listar sessões:', error);
            throw error;
        }
    }
    /**
     * Revogar sessão específica
     */
    async revokeSession(req, res) {
        try {
            const userId = req.user?.id;
            const { sessionId } = req.params;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            if (!sessionId) {
                throw (0, errorHandler_1.createError)('ID da sessão é obrigatório', 400, 'MISSING_SESSION_ID');
            }
            await user_service_1.default.revokeSession(userId, sessionId);
            res.json({
                success: true,
                message: 'Sessão revogada com sucesso',
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao revogar sessão:', error);
            throw error;
        }
    }
    /**
     * Revogar todas as sessões (exceto a atual)
     */
    async revokeAllSessions(req, res) {
        try {
            const userId = req.user?.id;
            const currentToken = req.headers.authorization?.replace('Bearer ', '');
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            const revokedCount = await user_service_1.default.revokeAllSessions(userId, currentToken);
            res.json({
                success: true,
                message: `${revokedCount} sessões foram revogadas`,
                revokedCount,
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao revogar todas as sessões:', error);
            throw error;
        }
    }
    /**
     * Excluir conta do usuário
     */
    async deleteAccount(req, res) {
        try {
            const userId = req.user?.id;
            const { password } = req.body;
            if (!userId) {
                throw (0, errorHandler_1.createError)('Usuário não autenticado', 401, 'UNAUTHORIZED');
            }
            if (!password) {
                throw (0, errorHandler_1.createError)('Senha é obrigatória para excluir a conta', 400, 'PASSWORD_REQUIRED');
            }
            await user_service_1.default.deleteAccount(userId, password);
            res.json({
                success: true,
                message: 'Conta excluída com sucesso',
            });
        }
        catch (error) {
            logger_1.logger.error('Erro ao excluir conta:', error);
            throw error;
        }
    }
}
exports.default = new UserController();
