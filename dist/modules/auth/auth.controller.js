"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("./auth.service"));
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = require("../../utils/logger");
const helpers_1 = require("../../utils/helpers");
class AuthController {
    register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { name, email, password, referralCode } = req.body;
        const result = await auth_service_1.default.register({
            name,
            email,
            password,
            referralCode,
        });
        logger_1.logger.info(`📝 Registro realizado: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.status(201).json({
            success: true,
            message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
            data: {
                user: result.user,
                emailSent: result.emailSent,
            },
        });
    });
    login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        const result = await auth_service_1.default.login({ email, password });
        logger_1.logger.info(`🔐 Login realizado: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: result,
        });
    });
    verifyEmail = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Token de verificação é obrigatório',
                code: 'MISSING_TOKEN',
            });
        }
        const result = await auth_service_1.default.verifyEmail(token);
        logger_1.logger.info(`✅ Email verificado: ${result.user.email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
        return res.json({
            success: true,
            message: 'Email verificado com sucesso!',
            data: result,
        });
    });
    resendVerification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        const result = await auth_service_1.default.resendVerification(email);
        logger_1.logger.info(`📧 Reenvio de verificação: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.json({
            success: true,
            message: 'Email de verificação enviado. Verifique sua caixa de entrada.',
            data: result,
        });
    });
    forgotPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        const result = await auth_service_1.default.forgotPassword(email);
        logger_1.logger.info(`🔑 Solicitação de recuperação: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.json({
            success: true,
            message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
            data: result,
        });
    });
    resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { token, password } = req.body;
        const result = await auth_service_1.default.resetPassword(token, password);
        logger_1.logger.info(`🔑 Senha redefinida - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.json({
            success: true,
            message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
            data: result,
        });
    });
    refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await auth_service_1.default.refreshToken(refreshToken);
        res.json({
            success: true,
            message: 'Token renovado com sucesso',
            data: result,
        });
    });
    logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await auth_service_1.default.logout(refreshToken);
        logger_1.logger.info(`👋 Logout realizado - IP: ${(0, helpers_1.getClientIP)(req)}`);
        res.json({
            success: true,
            message: 'Logout realizado com sucesso',
            data: result,
        });
    });
    getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        res.json({
            success: true,
            message: 'Perfil obtido com sucesso',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                },
            },
        });
    });
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map