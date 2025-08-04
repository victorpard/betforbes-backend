import { Request, Response } from 'express';
import userService from './user.service';
import { createError } from '../../middlewares/errorHandler';
import { logger } from '../../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    isVerified: boolean;
  };
}

class UserController {
  /**
   * Obter perfil do usuário autenticado
   */
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      const user = await userService.getProfile(userId);

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      logger.error('Erro ao obter perfil:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const updateData = req.body;

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      const user = await userService.updateProfile(userId, updateData);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user,
      });
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      await userService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  /**
   * Listar sessões ativas do usuário
   */
  async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      const sessions = await userService.getSessions(userId);

      res.json({
        success: true,
        sessions,
      });
    } catch (error) {
      logger.error('Erro ao listar sessões:', error);
      throw error;
    }
  }

  /**
   * Revogar sessão específica
   */
  async revokeSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      if (!sessionId) {
        throw createError('ID da sessão é obrigatório', 400, 'MISSING_SESSION_ID');
      }

      await userService.revokeSession(userId, sessionId);

      res.json({
        success: true,
        message: 'Sessão revogada com sucesso',
      });
    } catch (error) {
      logger.error('Erro ao revogar sessão:', error);
      throw error;
    }
  }

  /**
   * Revogar todas as sessões (exceto a atual)
   */
  async revokeAllSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const currentToken = req.headers.authorization?.replace('Bearer ', '');

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      const revokedCount = await userService.revokeAllSessions(userId, currentToken);

      res.json({
        success: true,
        message: `${revokedCount} sessões foram revogadas`,
        revokedCount,
      });
    } catch (error) {
      logger.error('Erro ao revogar todas as sessões:', error);
      throw error;
    }
  }

  /**
   * Excluir conta do usuário
   */
  async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { password } = req.body;

      if (!userId) {
        throw createError('Usuário não autenticado', 401, 'UNAUTHORIZED');
      }

      if (!password) {
        throw createError('Senha é obrigatória para excluir a conta', 400, 'PASSWORD_REQUIRED');
      }

      await userService.deleteAccount(userId, password);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso',
      });
    } catch (error) {
      logger.error('Erro ao excluir conta:', error);
      throw error;
    }
  }
}

export default new UserController();

