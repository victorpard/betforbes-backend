import prisma from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../utils/helpers';
import { createError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  birthDate?: string;
}

class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
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
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return {
      ...user,
      balance: parseFloat(user.balance.toString()),
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileData) {
    const { name, phone, birthDate } = updateData;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (birthDate !== undefined) {
      dataToUpdate.birthDate = birthDate ? new Date(birthDate) : null;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      throw createError('Nenhum dado fornecido para atualização', 400, 'NO_DATA_TO_UPDATE');
    }

    const user = await prisma.user.update({
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

    logger.info(`👤 Perfil atualizado: ${user.email}`);

    return {
      ...user,
      balance: parseFloat(user.balance.toString()),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw createError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw createError('A nova senha deve ser diferente da senha atual', 400, 'SAME_PASSWORD');
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    await prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    logger.info(`🔑 Senha alterada: ${user.email}`);

    return { success: true };
  }

  async getSessions(userId: string) {
    return await prisma.userSession.findMany({
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
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
        isActive: true,
      },
    });

    if (!session) {
      throw createError('Sessão não encontrada', 404, 'SESSION_NOT_FOUND');
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    logger.info(`🔒 Sessão revogada: ${sessionId}`);

    return { success: true };
  }

  async revokeAllSessions(userId: string, currentToken?: string) {
    const whereClause: any = {
      userId,
      isActive: true,
    };

    if (currentToken) {
      whereClause.token = { not: currentToken };
    }

    const result = await prisma.userSession.updateMany({
      where: whereClause,
      data: { isActive: false },
    });

    logger.info(`🔒 ${result.count} sessões revogadas para usuário: ${userId}`);

    return result.count;
  }

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, password: true },
    });

    if (!user) throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createError('Senha incorreta', 400, 'INVALID_PASSWORD');
    }

    await prisma.user.delete({ where: { id: userId } });

    logger.info(`🗑️  Conta excluída: ${user.email}`);

    return { success: true };
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        lastLoginAt: true,
        balance: true,
      },
    });

    if (!user) throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');

    const activeSessions = await prisma.userSession.count({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    const daysSinceRegistration = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      userId: user.id,
      balance: parseFloat(user.balance.toString()),
      daysSinceRegistration,
      lastLoginAt: user.lastLoginAt,
      activeSessions,
      totalBets: 0,
      totalWins: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
    };
  }

  async canDeleteAccount(userId: string): Promise<{ canDelete: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (user && parseFloat(user.balance.toString()) > 0) {
      reasons.push('Usuário possui saldo em conta');
    }

    return {
      canDelete: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Obter perfil do usuário com dados do afiliado (quem indicou)
   */
  async getProfileWithAffiliate(userId: string) {
    const user = await prisma.user.findUnique({
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
        referrer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      throw createError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return {
      ...user,
      balance: parseFloat(user.balance.toString()),
      referredBy: user.referrer
        ? {
            name: user.referrer.name,
            email: user.referrer.email,
          }
        : null,
    };
  }
}

export default new UserService();
