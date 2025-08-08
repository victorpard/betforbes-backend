import prisma from '@/lib/prisma';
import jwtService from '@/lib/jwt';
import emailService from '@/utils/email';
import { hashPassword, verifyPassword, generateSecureToken, getExpirationDate } from '@/utils/helpers';
import { createError } from '@/middlewares/errorHandler';
import { logger } from '@/utils/logger';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    balance: number;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(data: RegisterData): Promise<{ user: any; emailSent: boolean }> {
    const { name, email, password, referralCode } = data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Verificar código de referência se fornecido
    let referredBy = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      
      if (!referrer) {
        throw createError('Código de referência inválido', 400, 'INVALID_REFERRAL_CODE');
      }
      
      referredBy = referrer.id;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Gerar código de referência único
    let userReferralCode: string;
    do {
      userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await prisma.user.findUnique({ where: { referralCode: userReferralCode } }));

    // Criar usuário
    const user = await prisma.user.create({
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

    // Gerar token de verificação de email
    const verificationToken = generateSecureToken();
    const expiresAt = getExpirationDate(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440')); // 24 horas

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email de verificação
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    logger.info(`👤 Novo usuário registrado: ${user.email}`);

    return {
      user,
      emailSent,
    };
  }

  /**
   * Faz login do usuário
   */
  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw createError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      throw createError('Conta desativada', 401, 'ACCOUNT_DISABLED');
    }

    // Verificar se email foi verificado
    if (!user.isVerified) {
      throw createError('Email não verificado', 401, 'EMAIL_NOT_VERIFIED');
    }

    // Gerar tokens
    const tokens = jwtService.generateTokenPair(user);

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Salvar sessão
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    logger.info(`🔐 Login realizado: ${user.email}`);

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

  /**
   * Verifica email do usuário
   */
  async verifyEmail(token: string): Promise<{ user: any }> {
    // Buscar token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      throw createError('Token de verificação inválido', 400, 'INVALID_TOKEN');
    }

    if (verificationToken.used) {
      throw createError('Token já foi utilizado', 400, 'TOKEN_ALREADY_USED');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw createError('Token expirado', 400, 'TOKEN_EXPIRED');
    }

    // Marcar usuário como verificado
    const user = await prisma.user.update({
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

    // Marcar token como usado
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    });

    logger.info(`✅ Email verificado: ${user.email}`);

    return { user };
  }

  /**
   * Reenvia email de verificação
   */
  async resendVerification(email: string): Promise<{ emailSent: boolean }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    if (user.isVerified) {
      throw createError('Email já verificado', 400, 'EMAIL_ALREADY_VERIFIED');
    }

    // Invalidar tokens anteriores
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: { used: true },
    });

    // Gerar novo token
    const verificationToken = generateSecureToken();
    const expiresAt = getExpirationDate(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440'));

    await prisma.emailVerificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    logger.info(`📧 Email de verificação reenviado: ${user.email}`);

    return { emailSent };
  }

  /**
   * Solicita recuperação de senha
   */
  async forgotPassword(email: string): Promise<{ emailSent: boolean }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Por segurança, não revelar se o email existe
      return { emailSent: true };
    }

    // Invalidar tokens anteriores
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: { used: true },
    });

    // Gerar token de reset
    const resetToken = generateSecureToken();
    const expiresAt = getExpirationDate(parseInt(process.env.PASSWORD_RESET_EXPIRES || '60')); // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Enviar email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    logger.info(`🔑 Solicitação de recuperação de senha: ${user.email}`);

    return { emailSent };
  }

  /**
   * Redefine senha do usuário
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    // Buscar token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw createError('Token de recuperação inválido', 400, 'INVALID_TOKEN');
    }

    if (resetToken.used) {
      throw createError('Token já foi utilizado', 400, 'TOKEN_ALREADY_USED');
    }

    if (resetToken.expiresAt < new Date()) {
      throw createError('Token expirado', 400, 'TOKEN_EXPIRED');
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Invalidar todas as sessões do usuário
    await prisma.userSession.updateMany({
      where: { userId: resetToken.userId },
      data: { isActive: false },
    });

    logger.info(`🔑 Senha redefinida: ${resetToken.user.email}`);

    return { success: true };
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verificar se sessão existe e está ativa
    const session = await prisma.userSession.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      throw createError('Refresh token inválido ou expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Gerar novo access token
    const accessToken = jwtService.refreshAccessToken(refreshToken);

    logger.info(`🔄 Token renovado: ${session.user.email}`);

    return { accessToken };
  }

  /**
   * Logout
   */
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    // Desativar sessão
    await prisma.userSession.updateMany({
      where: { token: refreshToken },
      data: { isActive: false },
    });

    logger.info(`👋 Logout realizado`);

    return { success: true };
  }
}

export default new AuthService();

