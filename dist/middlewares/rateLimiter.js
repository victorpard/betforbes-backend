"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.emailVerificationLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (0, helpers_1.getClientIP)(req),
    handler: (req, res) => {
        const ip = (0, helpers_1.getClientIP)(req);
        logger_1.logger.warn(`🚫 Rate limit excedido para IP: ${ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas. Tente novamente em alguns minutos.',
            code: 'RATE_LIMIT_EXCEEDED',
        });
    },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => (0, helpers_1.getClientIP)(req),
    handler: (req, res) => {
        const ip = (0, helpers_1.getClientIP)(req);
        logger_1.logger.warn(`🚫 Rate limit de autenticação excedido para IP: ${ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
        });
    },
});
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (0, helpers_1.getClientIP)(req),
    handler: (req, res) => {
        const ip = (0, helpers_1.getClientIP)(req);
        logger_1.logger.warn(`🚫 Rate limit de recuperação de senha excedido para IP: ${ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas solicitações de recuperação de senha. Tente novamente em 1 hora.',
            code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        });
    },
});
exports.emailVerificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: 'Muitas solicitações de verificação de email. Tente novamente em 10 minutos.',
        code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (0, helpers_1.getClientIP)(req),
    handler: (req, res) => {
        const ip = (0, helpers_1.getClientIP)(req);
        logger_1.logger.warn(`🚫 Rate limit de verificação de email excedido para IP: ${ip}`);
        res.status(429).json({
            success: false,
            message: 'Muitas solicitações de verificação de email. Tente novamente em 10 minutos.',
            code: 'EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED',
        });
    },
});
exports.rateLimiter = exports.generalLimiter;
//# sourceMappingURL=rateLimiter.js.map