"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt = __importStar(require("jsonwebtoken"));
const auth_service_1 = __importDefault(require("./auth.service"));
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = __importDefault(require("../../utils/logger"));
const helpers_1 = require("../../utils/helpers");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
function getBearerToken(req) {
    const h = req.headers.authorization || '';
    if (!h || !h.toLowerCase().startsWith('bearer '))
        return null;
    return h.slice(7).trim();
}
function requireSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        logger_1.default.error('JWT_SECRET não configurado nas variáveis de ambiente.');
        throw new Error('JWT_SECRET ausente');
    }
    return secret;
}
function signJwt(payload, envKey, fallback) {
    const secret = requireSecret();
    const expiresIn = process.env[envKey] ?? fallback;
    return jwt.sign(payload, secret, { expiresIn });
}
function signAccessToken(payload) {
    return signJwt(payload, 'JWT_EXPIRES_IN', '7d');
}
function signRefreshToken(payload) {
    return signJwt(payload, 'JWT_REFRESH_EXPIRES_IN', '30d');
}
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.registerSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { name, email, password, referralCode } = req.body;
    const ipAddress = (0, helpers_1.getClientIP)(req);
    const result = await auth_service_1.default.register({ name, email, password, referralCode });
    logger_1.default.info(`📝 Registro criado para ${email} (IP ${ipAddress})`);
    return res.status(201).json({
        success: true,
        message: 'Conta criada. Verifique seu e-mail para confirmar.',
        ...result,
    });
}));
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.loginSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { email, password } = req.body;
    const ipAddress = (0, helpers_1.getClientIP)(req);
    const loginRes = await auth_service_1.default.login({ email, password });
    let accessToken = loginRes?.accessToken ?? loginRes?.token ?? loginRes?.jwt ?? null;
    let refreshToken = loginRes?.refreshToken ?? loginRes?.rt ?? null;
    const user = loginRes?.user ?? loginRes?.profile ?? loginRes?.data?.user ?? null;
    if (!user || !user.id || !user.email) {
        return res.status(500).json({ success: false, message: 'Resposta de login inválida: usuário ausente.' });
    }
    const payload = {
        userId: user.id,
        email: user.email,
    };
    if (user.role)
        payload.role = user.role;
    try {
        if (!accessToken)
            accessToken = signAccessToken(payload);
        if (!refreshToken)
            refreshToken = signRefreshToken(payload);
    }
    catch {
        return res.status(500).json({ success: false, message: 'Falha ao gerar token. Verifique JWT_SECRET.' });
    }
    logger_1.default.info(`🔐 Login de ${email} (IP ${ipAddress})`);
    return res.json({
        success: true,
        token: accessToken,
        accessToken,
        refreshToken,
        user,
    });
}));
router.post('/verify-email', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.body || {};
    if (!token) {
        return res.status(400).json({ success: false, message: 'Token de verificação ausente.' });
    }
    await auth_service_1.default.verifyEmail(token);
    return res.json({ success: true, message: 'E-mail verificado com sucesso.' });
}));
router.post('/resend-verification', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.resendVerificationSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { email } = req.body;
    await auth_service_1.default.resendVerification(email);
    return res.json({ success: true, message: 'E-mail de verificação reenviado.' });
}));
router.post('/forgot-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.forgotPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { email } = req.body;
    await auth_service_1.default.forgotPassword(email);
    return res.json({ success: true, message: 'Se o e-mail existir, enviaremos instruções.' });
}));
router.post('/reset-password', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.resetPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { token, password } = req.body;
    await auth_service_1.default.resetPassword(token, password);
    return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
}));
router.post('/refresh', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.refreshTokenSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { refreshToken } = req.body;
    const r = await auth_service_1.default.refreshToken(refreshToken);
    let newAccessToken = r?.accessToken ?? r?.token ?? r?.jwt ?? null;
    if (!newAccessToken) {
        const secret = requireSecret();
        try {
            const decoded = jwt.verify(refreshToken, secret);
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
            };
            if (decoded.role)
                payload.role = decoded.role;
            newAccessToken = signAccessToken(payload);
        }
        catch {
            return res.status(401).json({ success: false, message: 'Refresh token inválido ou expirado.' });
        }
    }
    return res.json({ success: true, token: newAccessToken, accessToken: newAccessToken });
}));
router.post('/logout', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { error: vErr } = auth_validation_1.logoutSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
        const message = vErr.details.map((d) => d.message).join(' ');
        return res.status(400).json({ success: false, message });
    }
    const { refreshToken } = req.body;
    await auth_service_1.default.logout(refreshToken);
    return res.json({ success: true, message: 'Logout efetuado.' });
}));
router.get('/validate', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token ausente.' });
    }
    const secret = requireSecret();
    try {
        const decoded = jwt.verify(token, secret);
        return res.json({
            success: true,
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role ?? 'USER',
            },
        });
    }
    catch {
        return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.controller.js.map