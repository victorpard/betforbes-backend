"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = __importDefault(require("./auth.service"));
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = __importDefault(require("../../utils/logger"));
const helpers_1 = require("../../utils/helpers");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    req.body.confirmPassword = req.body.password;
    const { error: vErr } = auth_validation_1.registerSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { name, email, password, referralCode } = req.body;
    logger_1.default.info(`📝 Iniciando registro: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { user, emailSent } = await auth_service_1.default.register({ name, email, password, referralCode });
    logger_1.default.info(`✅ Registro concluído: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
        data: { user, emailSent },
    });
}));
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.loginSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { email, password } = req.body;
    logger_1.default.info(`🔐 Tentativa de login: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { user, tokens } = await auth_service_1.default.login({ email, password });
    logger_1.default.info(`🔓 Login realizado: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    return res.json({ success: true, message: 'Login realizado com sucesso', data: { user, tokens } });
}));
router.get('/verify-email', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = String(req.query.token || '');
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token de verificação é obrigatório' });
    }
    logger_1.default.info(`📧 Verificando email com token: ${token} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { user } = await auth_service_1.default.verifyEmail(token);
    logger_1.default.info(`✅ Email verificado: ${user.email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    return res.json({ success: true, message: 'Email verificado com sucesso!', data: { user } });
}));
router.post('/resend-verification', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.resendVerificationSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { email } = req.body;
    logger_1.default.info(`📧 Reenvio de verificação: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { emailSent } = await auth_service_1.default.resendVerification(email);
    return res.json({
        success: true,
        message: 'Email de verificação reenviado. Verifique sua caixa de entrada.',
        data: { emailSent },
    });
}));
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.forgotPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { email } = req.body;
    logger_1.default.info(`🔑 Recuperação de senha solicitada: ${email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { emailSent } = await auth_service_1.default.forgotPassword(email);
    return res.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
        data: { emailSent },
    });
}));
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.resetPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { token, password } = req.body;
    logger_1.default.info(`🔑 Reset de senha token: ${token} - IP: ${(0, helpers_1.getClientIP)(req)}`);
    await auth_service_1.default.resetPassword(token, password);
    logger_1.default.info(`✅ Senha redefinida - IP: ${(0, helpers_1.getClientIP)(req)}`);
    return res.json({ success: true, message: 'Senha redefinida com sucesso. Faça login novamente.' });
}));
router.post('/refresh-token', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.refreshTokenSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { refreshToken } = req.body;
    logger_1.default.info(`🔄 Renovando token - IP: ${(0, helpers_1.getClientIP)(req)}`);
    const { accessToken } = await auth_service_1.default.refreshToken(refreshToken);
    return res.json({ success: true, message: 'Token renovado com sucesso', data: { accessToken } });
}));
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.logoutSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const msg = vErr.details.map(d => d.message).join(' ');
        return res.status(400).json({ success: false, message: msg });
    }
    const { refreshToken } = req.body;
    logger_1.default.info(`👋 Logout solicitado - IP: ${(0, helpers_1.getClientIP)(req)}`);
    await auth_service_1.default.logout(refreshToken);
    return res.json({ success: true, message: 'Logout realizado com sucesso' });
}));
router.get('/validate-token', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    return res.json({ success: true, message: 'Token válido', data: { user } });
}));
router.get('/profile', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    return res.json({ success: true, message: 'Perfil obtido com sucesso', data: { user } });
}));
exports.default = router;
//# sourceMappingURL=auth.controller.js.map