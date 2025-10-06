// src/modules/auth/auth.service.ts
import { issueTokenPair } from '../../lib/jwt';
import { signWithJti } from '../../lib/signWithJti';
import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';
import jwt from 'jsonwebtoken';
import emailService from '../../utils/email';
import { hashPassword, verifyPassword, generateSecureToken, getExpirationDate } from '../../utils/helpers';
import { createError } from '../../middlewares/errorHandler';
import logger from '../../utils/logger';

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

/**
 * Normaliza código de referral vindo de query/string solta
 * (sem tocar em nome do usuário)
 */
const normalizeReferral = (code?: string) =>
  (code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

const findReferrerByAnyCode = async (
  code?: string
): Promise<{ id: string; email: string } | null> => {
  const normalized = normalizeReferral(code);
  if (!normalized) return null;

  // 1) user.referralCode
  const u = await prisma.user.findUnique({
    where: { referralCode: normalized },
    select: { id: true, email: true },
  });
  if (u) return u;

  // 2) affiliate.code (compatível entre branches — se existir)
  try {
    const affiliateClient = (prisma as any).affiliate;
    if (affiliateClient?.findUnique) {
      const a = await affiliateClient.findUnique({
        where: { code: normalized },
        select: { userId: true },
      });
      if (a?.userId) {
        const owner = await prisma.user.findUnique({
          where: { id: String(a.userId) },
          select: { id: true, email: true },
        });
        if (owner) return owner;
      }
    }
  } catch {
    // tabela pode não existir neste branch
  }

  return null;
};

/** ===== JWT helpers (assina SEMPRE com o id vindo do DB) ===== */
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

type UserCore = { id: string; email: string; role: string };

function _issueTokenPairOld(user: UserCore) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signWithJti(payload, JWT_SECRET, { expiresIn: '15m', jwtid: randomUUID() });
  const refreshToken = signWithJti(payload, JWT_REFRESH_SECRET, { expiresIn: '7d', jwtid: randomUUID() });
  return { accessToken, refreshToken };
}

function issueAccessToken(user: UserCore) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  return signWithJti(payload, JWT_SECRET, { expiresIn: '15m', jwtid: randomUUID() });
}

class AuthService {
  /**
   * Registro de novo usuário — único ponto onde definimos `name` a partir do input
   * (Não há qualquer auto-tradução/normalização de nome)
   */
  async register(data: RegisterData): Promise<{ user: any; emailSent: boolean }> {
    const { name, email, password } = data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      throw createError('Email já está em uso', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Normalizar/validar referral e resolver referenciador (ignora se inválido)
    let referredById: string | null = null;
    const raw = normalizeReferral(data.referralCode);
    if (raw && /^[A-Z0-9]{4,12}$/.test(raw)) {
      const ref = await prisma.user.findUnique({ where: { referralCode: raw } });
      if (ref) referredById = ref.id;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Gerar código de referência único (6 A-Z/0-9)
    let userReferralCode: string;
    do {
      userReferralCode = Array.from({ length: 6 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');
    } while (await prisma.user.findUnique({ where: { referralCode: userReferralCode } }));

    // Criar usuário (definimos apenas os campos necessários; name vem do input)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        referralCode: userReferralCode,
        referredById,
      },
      select: {
        id: true, name: true, email: true, role: true, isVerified: true, balance: true,
        referralCode: true, createdAt: true,
      },
    });

    // Gerar token de verificação de email
    const verificationToken = generateSecureToken();
    const expiresAt = getExpirationDate(parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || '1440'));
    await prisma.emailVerificationToken.create({
      data: { token: verificationToken, userId: user.id, expiresAt },
    });

    // Enviar email de verificação:
    // se houver referredById, embute ?code=<referralCode do referenciador> no link
    let extra: { code?: string } | undefined;
    if (referredById) {
      const refOwner = await prisma.user.findUnique({
        where: { id: referredById },
        select: { referralCode: true },
      });
      if (refOwner?.referralCode) {
        extra = { code: refOwner.referralCode };
      }
    }
    // cast para any para ser compatível mesmo antes do patch de type em emailService
    const emailSent = await (emailService as any).sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
      extra // { code } opcional
    );

    logger.info(`👤 Novo usuário: ${user.email} (refById=${referredById ?? 'null'})`);
    return { user, emailSent };
  }

  /**
   * Login — NÃO altera `name`
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

    // Gerar tokens **com id do DB**
    const tokens = issueTokenPair({ id: user.id, email: user.email, role: user.role });

    // Atualizar último login (sem tocar no name)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Salvar sessão (token de refresh)
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
   * Verifica email do usuário — NÃO altera `name`
   * Aplica referral apenas se ainda não houver referenciador.
   */
  async verifyEmail(token: string, referralRaw?: string): Promise<{ user: any }> {
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

    // Marcar usuário como verificado (sem tocar no name)
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

    // --- Auto-vínculo de referral na verificação (sem tocar no name) ---
    try {
      const raw = normalizeReferral(referralRaw);
      if (raw && /^[A-Z0-9]{4,12}$/.test(raw)) {
        // Só aplica se ainda não tiver referenciador
        const current = await prisma.user.findUnique({
          where: { id: user.id },
          select: { referredById: true },
        });
        if (current && !current.referredById) {
          const ref = await prisma.user.findUnique({
            where: { referralCode: raw },
            select: { id: true },
          });
          if (ref && ref.id !== user.id) {
            await prisma.user.update({
              where: { id: user.id },
              data: { referredById: ref.id },
            });
            logger.info(`🤝 Referral aplicado na verificação: ${user.email} -> code=${raw}`);
          }
        }
      }
    } catch (e) {
      logger.warn(`(verifyEmail) falha ao aplicar referral: ${(e as Error).message}`);
    }

    return { user };
  }

  /**
   * Reenvia email de verificação — NÃO altera `name`
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

    // Enviar email (sem mudar name)
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken
    );

    logger.info(`📧 Email de verificação reenviado: ${user.email}`);

    return { emailSent };
  }

  /**
   * Solicita recuperação de senha — NÃO altera `name`
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
   * Redefine senha — NÃO altera `name`
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

    // Atualizar senha (sem tocar no name)
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
   * Refresh token — NÃO altera `name`
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

    // Verificar assinatura do refresh token
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    } catch {
      throw createError('Refresh token inválido ou expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Garantir que o userId do token bate com a sessão/DB
    if (!payload?.userId || String(payload.userId) !== String(session.user.id)) {
      throw createError('Refresh token inválido', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Emitir novo access token com id do DB
    const accessToken = issueAccessToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    logger.info(`🔄 Token renovado: ${session.user.email}`);

    return { accessToken };
  }

  /**
   * Logout — NÃO altera `name`
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
