"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureToken = generateSecureToken;
exports.generateReferralCode = generateReferralCode;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.getExpirationDate = getExpirationDate;
exports.isValidEmail = isValidEmail;
exports.isStrongPassword = isStrongPassword;
exports.sanitizeString = sanitizeString;
exports.formatCurrency = formatCurrency;
exports.generateSlug = generateSlug;
exports.getClientIP = getClientIP;
exports.maskEmail = maskEmail;
exports.delay = delay;
exports.retryWithBackoff = retryWithBackoff;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Gera um token aleatório seguro
 */
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Gera um código de referência único
 */
function generateReferralCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Hash de senha com bcrypt
 */
async function hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcryptjs_1.default.hash(password, rounds);
}
/**
 * Verifica senha com hash
 */
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
/**
 * Calcula data de expiração
 */
function getExpirationDate(minutes) {
    return new Date(Date.now() + minutes * 60 * 1000);
}
/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Valida força da senha
 */
function isStrongPassword(password) {
    const errors = [];
    if (password.length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Sanitiza string removendo caracteres especiais
 */
function sanitizeString(str) {
    return str.replace(/[<>\"'&]/g, '');
}
/**
 * Formata valor monetário
 */
function formatCurrency(value, currency = 'USD') {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
    }).format(value);
}
/**
 * Gera slug a partir de string
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
/**
 * Extrai IP real do request
 */
function getClientIP(req) {
    return (req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        'unknown');
}
/**
 * Máscara para email (ex: j***@gmail.com)
 */
function maskEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2)
        return email;
    const [username, domain] = parts;
    if (!username || !domain)
        return email;
    if (username.length <= 2) {
        return `${username[0]}***@${domain}`;
    }
    return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
}
/**
 * Delay assíncrono
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry com backoff exponencial
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await delay(baseDelay * Math.pow(2, i));
            }
        }
    }
    throw lastError;
}
