"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../../lib/prisma"));
const jwt_1 = __importDefault(require("../../lib/jwt"));
const email_1 = __importDefault(require("../../utils/email"));
const helpers_1 = require("../../utils/helpers");
const errorHandler_1 = require("../../middlewares/errorHandler");
const logger_1 = __importDefault(require("../../utils/logger"));
class AuthService {
    async register(data) {
        const { name, email, password, referralCode } = data;
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw (0, errorHandler_1.createError)('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
        }
        let referredBy = null;
        if (referralCode) {
            const referrer = await prisma_1.default.user.findUnique({
                where: { referralCode },
            });
            if (!referrer) {
                throw (0, errorHandler_1.createError)('Código de referência inválido', 400, 'INVALID_REFERRAL_CODE');
            }
            referredBy = referrer.id;
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        let userReferralCode;
        do {
            userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (await prisma_1.default.user.findUnique({ where: { referralCode: userReferralCode } }));
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                referralCode: userReferralCode,
                referredBy,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                balance: true,
                referralCode: true,
                createdAt: true,
            },
        });
        const verificationToken = (0, helpers_1.generateSecureToken)();
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440'));
        await prisma_1.default.emailVerificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt,
            },
        });
        const emailSent = await email_1.default.sendVerificationEmail(user.email, user.name, verificationToken);
        logger_1.default.info(`👤 Novo usuário registrado: ${user.email}`);
        return {
            user,
            emailSent,
        };
    }
    async login(data) {
        const { email, password } = data;
        const user = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
        }
        const isPasswordValid = await (0, helpers_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
        }
        if (!user.isActive) {
            throw (0, errorHandler_1.createError)('Conta desativada', 401, 'ACCOUNT_DISABLED');
        }
        if (!user.isVerified) {
            throw (0, errorHandler_1.createError)("Email não verificado", 401, "EMAIL_NOT_VERIFIED");
        }
        const tokens = jwt_1.default.generateTokenPair(user);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        await prisma_1.default.userSession.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        logger_1.default.info(`🔐 Login realizado: ${user.email}`);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                balance: parseFloat(user.balance.toString()),
            },
            tokens,
        };
    }
    async verifyEmail(token) {
        const verificationToken = await prisma_1.default.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!verificationToken) {
            throw (0, errorHandler_1.createError)('Token de verificação inválido', 400, 'INVALID_TOKEN');
        }
        if (verificationToken.used) {
            throw (0, errorHandler_1.createError)('Token já foi utilizado', 400, 'TOKEN_ALREADY_USED');
        }
        if (verificationToken.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Token expirado', 400, 'TOKEN_EXPIRED');
        }
        const user = await prisma_1.default.user.update({
            where: { id: verificationToken.userId },
            data: { isVerified: true },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                balance: true,
            },
        });
        await prisma_1.default.emailVerificationToken.update({
            where: { id: verificationToken.id },
            data: { used: true },
        });
        logger_1.default.info(`✅ Email verificado: ${user.email}`);
        return { user };
    }
    async resendVerification(email) {
        const user = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Usuário não encontrado', 404, 'USER_NOT_FOUND');
        }
        if (user.isVerified) {
            throw (0, errorHandler_1.createError)('Email já verificado', 400, 'EMAIL_ALREADY_VERIFIED');
        }
        await prisma_1.default.emailVerificationToken.updateMany({
            where: {
                userId: user.id,
                used: false,
            },
            data: { used: true },
        });
        const verificationToken = (0, helpers_1.generateSecureToken)();
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440'));
        await prisma_1.default.emailVerificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt,
            },
        });
        const emailSent = await email_1.default.sendVerificationEmail(user.email, user.name, verificationToken);
        logger_1.default.info(`📧 Email de verificação reenviado: ${user.email}`);
        return { emailSent };
    }
    async forgotPassword(email) {
        const user = await prisma_1.default.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return { emailSent: true };
        }
        await prisma_1.default.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                used: false,
            },
            data: { used: true },
        });
        const resetToken = (0, helpers_1.generateSecureToken)();
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.PASSWORD_RESET_EXPIRES || '60'));
        await prisma_1.default.passwordResetToken.create({
            data: {
                token: resetToken,
                userId: user.id,
                expiresAt,
            },
        });
        const emailSent = await email_1.default.sendPasswordResetEmail(user.email, user.name, resetToken);
        logger_1.default.info(`🔑 Solicitação de recuperação de senha: ${user.email}`);
        return { emailSent };
    }
    async resetPassword(token, newPassword) {
        const resetToken = await prisma_1.default.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetToken) {
            throw (0, errorHandler_1.createError)('Token de recuperação inválido', 400, 'INVALID_TOKEN');
        }
        if (resetToken.used) {
            throw (0, errorHandler_1.createError)('Token já foi utilizado', 400, 'TOKEN_ALREADY_USED');
        }
        if (resetToken.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Token expirado', 400, 'TOKEN_EXPIRED');
        }
        const hashedPassword = await (0, helpers_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        });
        await prisma_1.default.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true },
        });
        await prisma_1.default.userSession.updateMany({
            where: { userId: resetToken.userId },
            data: { isActive: false },
        });
        logger_1.default.info(`🔑 Senha redefinida: ${resetToken.user.email}`);
        return { success: true };
    }
    async refreshToken(refreshToken) {
        const session = await prisma_1.default.userSession.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!session || !session.isActive || session.expiresAt < new Date()) {
            throw (0, errorHandler_1.createError)('Refresh token inválido ou expirado', 401, 'INVALID_REFRESH_TOKEN');
        }
        const accessToken = jwt_1.default.refreshAccessToken(refreshToken);
        logger_1.default.info(`🔄 Token renovado: ${session.user.email}`);
        return { accessToken };
    }
    async logout(refreshToken) {
        await prisma_1.default.userSession.updateMany({
            where: { token: refreshToken },
            data: { isActive: false },
        });
        logger_1.default.info(`👋 Logout realizado`);
        return { success: true };
    }
}
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map