
import Joi from 'joi';

// Pattern que obriga:
// - pelo menos 1 letra minúscula
// - pelo menos 1 letra maiúscula
// - pelo menos 1 número
// - pelo menos 1 caractere especial
// - no mínimo 8 caracteres
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;

// Schema para registro de usuário
export const registerSchema = Joi.object({
  name: Joi.string()
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

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),

  password: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.pattern.base':
        'Senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'any.required': 'Senha é obrigatória',
    }),

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'As senhas não coincidem',
      'string.empty': 'Confirmação de senha é obrigatória',
    }),

  referralCode: Joi.string()
    .length(8)
    .uppercase()
    .optional()
    .messages({
      'string.length': 'Código de referência deve ter exatamente 8 caracteres',
    }),
});

// Schema para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email é obrigatório',
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório',
    }),

  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'any.required': 'Senha é obrigatória',
    }),
});

// Schema para esqueci minha senha
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
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

// Schema para redefinir senha
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Token é obrigatório',
      'any.required': 'Token é obrigatório',
    }),

  password: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty': 'Nova senha é obrigatória',
      'string.pattern.base':
        'Nova senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'any.required': 'Nova senha é obrigatória',
    }),
});

// Schema para reenviar verificação de email
export const resendVerificationSchema = Joi.object({
  email: Joi.string()
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

// Schema para refresh token
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token é obrigatório',
      'any.required': 'Refresh token é obrigatório',
    }),
});

// Schema para logout
export const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token é obrigatório',
      'any.required': 'Refresh token é obrigatório',
    }),
});

// Schema para atualizar perfil
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
    }),

  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Telefone deve ter um formato válido',
    }),

  birthDate: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Data de nascimento não pode ser no futuro',
    }),
});

// Schema para alterar senha dentro do perfil
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha atual é obrigatória',
      'any.required': 'Senha atual é obrigatória',
    }),

  newPassword: Joi.string()
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.empty': 'Nova senha é obrigatória',
      'string.pattern.base':
        'Nova senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial',
      'any.required': 'Nova senha é obrigatória',
    }),
});

// Validações auxiliares (opcionais)
export const customValidations = {
  emailExists: async (email: string): Promise<boolean> => {
    return false;
  },

  passwordStrength: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;
    if (password.length >= 8) score++;
    else feedback.push('Use pelo menos 8 caracteres');
    if (password.length >= 12) score++;
    else feedback.push('Use pelo menos 12 caracteres para maior segurança');
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Inclua letras minúsculas');
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Inclua letras maiúsculas');
    if (/\d/.test(password)) score++;
    else feedback.push('Inclua números');
    if (/[^a-zA-Z\d]/.test(password)) score++;
    else feedback.push('Inclua símbolos especiais');
    if (!/(.)\1{2,}/.test(password)) score++;
    else feedback.push('Evite repetir caracteres');
    if (!/123|abc|qwe|password|admin/i.test(password)) score++;
    else feedback.push('Evite sequências ou palavras comuns');
    return { score, feedback };
  },

  isValidToken: (token: string): boolean => /^[a-f0-9]{64}$/.test(token),
  isValidUUID: (uuid: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid),
};
