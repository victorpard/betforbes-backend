"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.validate = exports.refreshTokenSchema = exports.verifyEmailSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.resendVerificationSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .required()
        .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
        'any.required': 'Nome é obrigatório',
    }),
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.min': 'Senha deve ter pelo menos 8 caracteres',
        'string.max': 'Senha deve ter no máximo 128 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Senha é obrigatória',
    }),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref('password'))
        .required()
        .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha',
        'any.required': 'Confirmação de senha é obrigatória',
    }),
    referralCode: joi_1.default.string()
        .optional()
        .allow('')
        .max(20),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Senha é obrigatória',
    }),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Token é obrigatório',
    }),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.min': 'Senha deve ter pelo menos 8 caracteres',
        'string.max': 'Senha deve ter no máximo 128 caracteres',
        'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Senha é obrigatória',
    }),
    confirmPassword: joi_1.default.string()
        .valid(joi_1.default.ref('password'))
        .required()
        .messages({
        'any.only': 'Confirmação de senha deve ser igual à senha',
        'any.required': 'Confirmação de senha é obrigatória',
    }),
});
exports.resendVerificationSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email deve ter um formato válido',
        'any.required': 'Email é obrigatório',
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
        'string.min': 'Nome deve ter pelo menos 2 caracteres',
        'string.max': 'Nome deve ter no máximo 100 caracteres',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{1,14}$/)
        .optional()
        .allow('')
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
        'any.required': 'Senha atual é obrigatória',
    }),
    newPassword: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
        'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
        'string.max': 'Nova senha deve ter no máximo 128 caracteres',
        'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
        'any.required': 'Nova senha é obrigatória',
    }),
    confirmNewPassword: joi_1.default.string()
        .valid(joi_1.default.ref('newPassword'))
        .required()
        .messages({
        'any.only': 'Confirmação da nova senha deve ser igual à nova senha',
        'any.required': 'Confirmação da nova senha é obrigatória',
    }),
});
exports.verifyEmailSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Token de verificação é obrigatório',
    }),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Refresh token é obrigatório',
    }),
});
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos',
                errors,
            });
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
exports.validateRequest = exports.validate;
//# sourceMappingURL=validation.js.map