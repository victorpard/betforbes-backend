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
const logger_1 = require("../../utils/logger");
class AuthService {
    /**
     * Registra um novo usuário
     */
    async register(data) {
        const { name, email, password, referralCode } = data;
        const normalizedEmail = email.trim().toLowerCase();
        logger_1.logger.info('[SERVICE][REGISTER] tentar registrar email:', { original: email, normalizedEmail });
        // Verificar se email já existe (com contorno via DEBUG)
        let existingUser = null;
        try {
            existingUser = await prisma_1.default.user.findUnique({
                where: { email: normalizedEmail },
            });
            logger_1.logger.info('[SERVICE][REGISTER] resultado da busca de existência:', { existingUser });
        }
        catch (e) {
            logger_1.logger.warn('[SERVICE][REGISTER] falha ao buscar existingUser (continuando):', { error: e });
        }
        if (existingUser) {
            if (process.env.SKIP_EMAIL_UNIQUENESS_FOR_DEBUG === '1') {
                logger_1.logger.warn('[SERVICE][REGISTER] conflito de email detectado mas ignorado por DEBUG:', normalizedEmail);
            }
            else {
                throw (0, errorHandler_1.createError)('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
            }
        }
        // Verificar código de referência se fornecido
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
        // Hash da senha
        const hashedPassword = await (0, helpers_1.hashPassword)(password);
        // Gerar código de referência único
        let userReferralCode;
        let attempts = 0;
        do {
            userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            attempts += 1;
            if (attempts > 10) {
                throw (0, errorHandler_1.createError)('Erro ao gerar código de afiliado', 500, 'REFERRAL_CODE_GENERATION_FAILED');
            }
        } while (await prisma_1.default.user.findUnique({
            where: { referralCode: userReferralCode },
        }));
        // Monta dados condicionalmente para evitar conflito de tipos
        const createData = {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            referralCode: userReferralCode,
        };
        if (referredBy) {
            createData.referredBy = referredBy;
            createData.referredById = referredBy;
        }
        // Criar usuário
        const user = await prisma_1.default.user.create({
            data: createData,
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
        // Gerar token de verificação de email
        const verificationToken = (0, helpers_1.generateSecureToken)();
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440', 10)); // 24 horas por padrão
        await prisma_1.default.emailVerificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt,
            },
        });
        // Enviar email de verificação
        const emailSent = await email_1.default.sendVerificationEmail(user.email, user.name, verificationToken);
        logger_1.logger.info(`👤 Novo usuário registrado: ${user.email}; emailSent=${emailSent}`);
        return {
            user,
            emailSent,
        };
    }
    /**
     * Faz login do usuário
     */
    async login(data) {
        const { email, password } = data;
        const normalizedEmail = email.trim().toLowerCase();
        logger_1.logger.info('[SERVICE][LOGIN] tentativa de login para:', { email: normalizedEmail });
        // Buscar usuário
        const user = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
        }
        // Verificar senha
        const isPasswordValid = await (0, helpers_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw (0, errorHandler_1.createError)('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
        }
        // Verificar se conta está ativa
        if (!user.isActive) {
            throw (0, errorHandler_1.createError)('Conta desativada', 401, 'ACCOUNT_DISABLED');
        }
        // Verificar se email foi verificado
        if (!user.isVerified) {
            throw (0, errorHandler_1.createError)('Email não verificado', 401, 'EMAIL_NOT_VERIFIED');
        }
        // Gerar tokens
        const tokens = jwt_1.default.generateTokenPair(user);
        // Atualizar último login
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        // Salvar sessão
        await prisma_1.default.userSession.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
            },
        });
        logger_1.logger.info(`🔐 Login realizado: ${user.email}`);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                balance: parseFloat(user.balance.toString()),
                referralCode: user.referralCode || null,
            },
            tokens,
        };
    }
    /**
     * Verifica email do usuário
     */
    async verifyEmail(token) {
        logger_1.logger.info('[SERVICE][VERIFY_EMAIL] verificando token:', token);
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
        logger_1.logger.info(`✅ Email verificado: ${user.email}`);
        return { user };
    }
    /**
     * Reenvia email de verificação
     */
    async resendVerification(email) {
        const normalizedEmail = email.trim().toLowerCase();
        logger_1.logger.info('[SERVICE][RESEND_VERIFICATION] para:', normalizedEmail);
        const user = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
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
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440', 10));
        await prisma_1.default.emailVerificationToken.create({
            data: {
                token: verificationToken,
                userId: user.id,
                expiresAt,
            },
        });
        const emailSent = await email_1.default.sendVerificationEmail(user.email, user.name, verificationToken);
        logger_1.logger.info(`📧 Email de verificação reenviado: ${user.email}; emailSent=${emailSent}`);
        return { emailSent };
    }
    /**
     * Solicita recuperação de senha
     */
    async forgotPassword(email) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prisma_1.default.user.findUnique({
            where: { email: normalizedEmail },
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
        const expiresAt = (0, helpers_1.getExpirationDate)(parseInt(process.env.PASSWORD_RESET_EXPIRES || '60', 10));
        await prisma_1.default.passwordResetToken.create({
            data: {
                token: resetToken,
                userId: user.id,
                expiresAt,
            },
        });
        const emailSent = await email_1.default.sendPasswordResetEmail(user.email, user.name, resetToken);
        logger_1.logger.info(`🔑 Solicitação de recuperação de senha: ${user.email}`);
        return { emailSent };
    }
    /**
     * Redefine senha do usuário
     */
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
        logger_1.logger.info(`🔑 Senha redefinida: ${resetToken.user.email}`);
        return { success: true };
    }
    /**
     * Refresh token
     */
    async refreshToken(refreshToken) {
        const session = await prisma_1.default.userSession.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!session ||
            !session.isActive ||
            (session.expiresAt && session.expiresAt < new Date())) {
            throw (0, errorHandler_1.createError)('Refresh token inválido ou expirado', 401, 'INVALID_REFRESH_TOKEN');
        }
        const accessToken = jwt_1.default.refreshAccessToken(refreshToken);
        logger_1.logger.info(`🔄 Token renovado: ${session.user.email}`);
        return { accessToken };
    }
    /**
     * Logout
     */
    async logout(refreshToken) {
        await prisma_1.default.userSession.updateMany({
            where: { token: refreshToken },
            data: { isActive: false },
        });
        logger_1.logger.info(`👋 Logout realizado`);
        return { success: true };
    }
}
exports.default = new AuthService();
