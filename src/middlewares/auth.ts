import { Request, Response, NextFunction } from 'express';
import jwtService from '../lib/jwt';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';
import { getClientIP } from '../utils/helpers';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
        isVerified: boolean;
      };
    }
  }
}

/**
 * Middleware de autenticação obrigatória
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido',
        code: 'NO_TOKEN',
      });
      return;
    }

    // Verificar token JWT
    const payload = jwtService.verifyAccessToken(token);

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Conta desativada',
        code: 'ACCOUNT_DISABLED',
      });
      return;
    }

    // Verificar se o email foi verificado (opcional, dependendo da rota)
    if (!user.isVerified && req.path !== '/auth/verify-email' && req.path !== '/auth/resend-verification') {
      res.status(401).json({
        success: false,
        message: 'Email não verificado',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }

    // Adicionar usuário ao request
    req.user = user;

    // Log da ação
    logger.info(`🔐 Usuário autenticado: ${user.email} (${user.role}) - IP: ${getClientIP(req)}`);

    next();
  } catch (error) {
    logger.error('❌ Erro na autenticação:', error);
    
    res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      code: 'INVALID_TOKEN',
    });
  }
};

/**
 * Middleware de autenticação opcional
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return next(); // Continua sem usuário
    }

    const payload = jwtService.verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário
    next();
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Acesso negado - usuário não autenticado',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`🚫 Acesso negado: ${req.user.email} tentou acessar rota que requer ${roles.join(' ou ')}`);
      
      res.status(403).json({
        success: false,
        message: 'Acesso negado - permissões insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se o email foi verificado
 */
export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Usuário não autenticado',
      code: 'NOT_AUTHENTICATED',
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      message: 'Email não verificado',
      code: 'EMAIL_NOT_VERIFIED',
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar se é admin
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Middleware para verificar se é admin ou moderador
 */
export const requireModerator = requireRole(['ADMIN', 'MODERATOR']);

// Alias para compatibilidade
export const authMiddleware = authenticateToken;

