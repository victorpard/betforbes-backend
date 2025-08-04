"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.verifyEmail = verifyEmail;
exports.resendVerification = resendVerification;
const auth_service_1 = __importDefault(require("./auth.service"));
const logger_1 = require("../../utils/logger");
async function register(req, res) {
    const { name, email, password, confirmPassword, referralCode } = req.body;
    logger_1.logger.info('[CONTROLLER][REGISTER] payload:', {
        name,
        email,
        referralCode,
    });
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Campos obrigatórios ausentes',
            code: 'MISSING_FIELDS',
            timestamp: new Date().toISOString(),
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords não conferem',
            code: 'PASSWORD_MISMATCH',
            timestamp: new Date().toISOString(),
        });
    }
    try {
        const result = await auth_service_1.default.register({
            name,
            email,
            password,
            referralCode,
        });
        return res.json({
            success: true,
            user: result.user,
            emailSent: result.emailSent,
        });
    }
    catch (err) {
        logger_1.logger.error('[CONTROLLER][REGISTER] erro:', err);
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Erro no registro',
            code: err.code || 'REGISTER_FAILED',
            timestamp: new Date().toISOString(),
        });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    logger_1.logger.info('[CONTROLLER][LOGIN] tentativa para:', { email });
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email e senha são obrigatórios',
            code: 'MISSING_CREDENTIALS',
            timestamp: new Date().toISOString(),
        });
    }
    try {
        const authResult = await auth_service_1.default.login({ email, password });
        return res.json({
            success: true,
            ...authResult,
        });
    }
    catch (err) {
        logger_1.logger.error('[CONTROLLER][LOGIN] erro:', err);
        return res.status(err.status || 401).json({
            success: false,
            message: err.message || 'Falha no login',
            code: err.code || 'LOGIN_FAILED',
            timestamp: new Date().toISOString(),
        });
    }
}
async function verifyEmail(req, res) {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    logger_1.logger.info('[CONTROLLER][VERIFY_EMAIL] token recebido:', token);
    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token de verificação ausente',
            code: 'MISSING_TOKEN',
            timestamp: new Date().toISOString(),
        });
    }
    try {
        const { user } = await auth_service_1.default.verifyEmail(token);
        return res.json({
            success: true,
            user,
        });
    }
    catch (err) {
        logger_1.logger.error('[CONTROLLER][VERIFY_EMAIL] erro:', err);
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Falha ao verificar email',
            code: err.code || 'VERIFY_EMAIL_FAILED',
            timestamp: new Date().toISOString(),
        });
    }
}
async function resendVerification(req, res) {
    const { email } = req.body;
    logger_1.logger.info('[CONTROLLER][RESEND_VERIFICATION] para:', { email });
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email é obrigatório',
            code: 'MISSING_EMAIL',
            timestamp: new Date().toISOString(),
        });
    }
    try {
        const { emailSent } = await auth_service_1.default.resendVerification(email);
        return res.json({
            success: true,
            emailSent,
        });
    }
    catch (err) {
        logger_1.logger.error('[CONTROLLER][RESEND_VERIFICATION] erro:', err);
        return res.status(err.status || 400).json({
            success: false,
            message: err.message || 'Falha ao reenviar verificação',
            code: err.code || 'RESEND_VERIFICATION_FAILED',
            timestamp: new Date().toISOString(),
        });
    }
}
