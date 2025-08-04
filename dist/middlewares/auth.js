"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.requireModerator = exports.requireAdmin = exports.requireVerifiedEmail = exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = __importDefault(require("../lib/jwt"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.default.extractTokenFromHeader(authHeader);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Token de acesso não fornecido',
                code: 'NO_TOKEN',
            });
            return;
        }
        const payload = jwt_1.default.verifyAccessToken(token);
        const user = await prisma_1.default.user.findUnique({
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
        if (!user.isVerified && req.path !== '/auth/verify-email' && req.path !== '/auth/resend-verification') {
            res.status(401).json({
                success: false,
                message: 'Email não verificado',
                code: 'EMAIL_NOT_VERIFIED',
            });
            return;
        }
        req.user = user;
        logger_1.logger.info(`🔐 Usuário autenticado: ${user.email} (${user.role}) - IP: ${(0, helpers_1.getClientIP)(req)}`);
        next();
    }
    catch (error) {
        logger_1.logger.error('❌ Erro na autenticação:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido ou expirado',
            code: 'INVALID_TOKEN',
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = jwt_1.default.extractTokenFromHeader(authHeader);
        if (!token) {
            return next();
        }
        const payload = jwt_1.default.verifyAccessToken(token);
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Acesso negado - usuário não autenticado',
                code: 'NOT_AUTHENTICATED',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            logger_1.logger.warn(`🚫 Acesso negado: ${req.user.email} tentou acessar rota que requer ${roles.join(' ou ')}`);
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
exports.requireRole = requireRole;
const requireVerifiedEmail = (req, res, next) => {
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
exports.requireVerifiedEmail = requireVerifiedEmail;
exports.requireAdmin = (0, exports.requireRole)(['ADMIN']);
exports.requireModerator = (0, exports.requireRole)(['ADMIN', 'MODERATOR']);
exports.authMiddleware = exports.authenticateToken;
//# sourceMappingURL=auth.js.map