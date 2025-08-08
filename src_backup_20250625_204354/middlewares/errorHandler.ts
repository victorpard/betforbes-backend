import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { getClientIP } from '@/utils/helpers';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware de tratamento de erros
 */
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log do erro
  logger.error('❌ Erro na aplicação:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'],
    user: req.user?.email || 'Não autenticado',
  });

  // Status code padrão
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';
  let code = error.code || 'INTERNAL_ERROR';

  // Tratamento de erros específicos
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados inválidos';
    code = 'VALIDATION_ERROR';
  }

  if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Não autorizado';
    code = 'UNAUTHORIZED';
  }

  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
    code = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
    code = 'TOKEN_EXPIRED';
  }

  // Erros do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      statusCode = 409;
      message = 'Dados já existem';
      code = 'DUPLICATE_ENTRY';
    }
    
    if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Registro não encontrado';
      code = 'NOT_FOUND';
    }
  }

  // Em produção, não expor detalhes do erro
  const response: any = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
  };

  // Em desenvolvimento, incluir mais detalhes
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = error.details;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware para capturar rotas não encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error: ApiError = new Error(`Rota não encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  
  next(error);
};

/**
 * Wrapper para funções async que podem gerar erros
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Cria um erro customizado
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  error.details = details;
  return error;
};

