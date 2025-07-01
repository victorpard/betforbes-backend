"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('❌ Erro na aplicação:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: (0, helpers_1.getClientIP)(req),
        userAgent: req.headers['user-agent'],
        user: req.user?.email || 'Não autenticado',
    });
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Erro interno do servidor';
    let code = error.code || 'INTERNAL_ERROR';
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
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
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
    const response = {
        success: false,
        message,
        code,
        timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
        response.details = error.details;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Rota não encontrada: ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode = 500, code, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (code)
        error.code = code;
    error.details = details;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map