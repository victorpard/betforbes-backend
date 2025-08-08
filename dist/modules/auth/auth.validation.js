"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customValidations = exports.changePasswordSchema = exports.updateProfileSchema = exports.logoutSchema = exports.refreshTokenSchema = exports.resendVerificationSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
        'string.empty': 'Nome é obrigatório',
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório',
    }),
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
    password: joi_1.default.string()
        .pattern(passwordPattern)
        .required()
        .messages({
        'string.empty': 'Senha é obrigatória',
        'string.pattern.base': 'Senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
        'any.required': 'Senha é obrigatória',
    }),
    confirmPassword: joi_1.default.string()
        .required()
        .valid(joi_1.default.ref('password'))
        .messages({
        'any.only': 'As senhas não coincidem',
        'string.empty': 'Confirmação de senha é obrigatória',
    }),
    referralCode: joi_1.default.string()
        .length(8)
        .uppercase()
        .optional()
        .messages({
        'string.length': 'Código de referência deve ter exatamente 8 caracteres',
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
    password: joi_1.default.string()
        .min(1)
        .required()
        .messages({
        'string.empty': 'Senha é obrigatória',
        'any.required': 'Senha é obrigatória',
    }),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Token é obrigatório',
        'any.required': 'Token é obrigatório',
    }),
    password: joi_1.default.string()
        .pattern(passwordPattern)
        .required()
        .messages({
        'string.empty': 'Nova senha é obrigatória',
        'string.pattern.base': 'Nova senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
        'any.required': 'Nova senha é obrigatória',
    }),
});
exports.resendVerificationSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
        'string.empty': 'Email é obrigatório',
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Refresh token é obrigatório',
        'any.required': 'Refresh token é obrigatório',
    }),
});
exports.logoutSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Refresh token é obrigatório',
        'any.required': 'Refresh token é obrigatório',
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .trim()
        .optional()
        .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Telefone deve ter um formato válido',
    }),
    birthDate: joi_1.default.date()
        .max('now')
        .optional()
        .messages({
        'date.max': 'Data de nascimento não pode ser no futuro',
    }),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Senha atual é obrigatória',
        'any.required': 'Senha atual é obrigatória',
    }),
    newPassword: joi_1.default.string()
        .pattern(passwordPattern)
        .required()
        .messages({
        'string.empty': 'Nova senha é obrigatória',
        'string.pattern.base': 'Nova senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
        'any.required': 'Nova senha é obrigatória',
    }),
});
exports.customValidations = {
    emailExists: async (email) => {
        return false;
    },
    passwordStrength: (password) => {
        const feedback = [];
        let score = 0;
        if (password.length >= 8)
            score++;
        else
            feedback.push('Use pelo menos 8 caracteres');
        if (password.length >= 12)
            score++;
        else
            feedback.push('Use pelo menos 12 caracteres para maior segurança');
        if (/[a-z]/.test(password))
            score++;
        else
            feedback.push('Inclua letras minúsculas');
        if (/[A-Z]/.test(password))
            score++;
        else
            feedback.push('Inclua letras maiúsculas');
        if (/\d/.test(password))
            score++;
        else
            feedback.push('Inclua números');
        if (/[^a-zA-Z\d]/.test(password))
            score++;
        else
            feedback.push('Inclua símbolos especiais');
        if (!/(.)\1{2,}/.test(password))
            score++;
        else
            feedback.push('Evite repetir caracteres');
        if (!/123|abc|qwe|password|admin/i.test(password))
            score++;
        else
            feedback.push('Evite sequências ou palavras comuns');
        return { score, feedback };
    },
    isValidToken: (token) => /^[a-f0-9]{64}$/.test(token),
    isValidUUID: (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
};
//# sourceMappingURL=auth.validation.js.map