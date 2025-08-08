import Joi from 'joi';

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
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Senha é obrigatória',
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.max': 'Senha deve ter no máximo 128 caracteres',
      'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      'any.required': 'Senha é obrigatória',
    }),

  referralCode: Joi.string()
    .length(6)
    .uppercase()
    .optional()
    .messages({
      'string.length': 'Código de referência deve ter exatamente 6 caracteres',
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
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Nova senha é obrigatória',
      'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
      'string.max': 'Nova senha deve ter no máximo 128 caracteres',
      'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
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

// Schema para alterar senha
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Senha atual é obrigatória',
      'any.required': 'Senha atual é obrigatória',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'Nova senha é obrigatória',
      'string.min': 'Nova senha deve ter pelo menos 8 caracteres',
      'string.max': 'Nova senha deve ter no máximo 128 caracteres',
      'string.pattern.base': 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      'any.required': 'Nova senha é obrigatória',
    }),
});

// Validações customizadas
export const customValidations = {
  // Validar se email já existe
  emailExists: async (email: string): Promise<boolean> => {
    // Esta função será implementada no service
    return false;
  },

  // Validar força da senha
  passwordStrength: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    // Comprimento
    if (password.length >= 8) score += 1;
    else feedback.push('Use pelo menos 8 caracteres');

    if (password.length >= 12) score += 1;
    else feedback.push('Use pelo menos 12 caracteres para maior segurança');

    // Caracteres
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Inclua letras minúsculas');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Inclua letras maiúsculas');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Inclua números');

    if (/[^a-zA-Z\d]/.test(password)) score += 1;
    else feedback.push('Inclua símbolos especiais');

    // Padrões comuns
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Evite repetir caracteres');

    if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
    else feedback.push('Evite sequências ou palavras comuns');

    return { score, feedback };
  },

  // Validar token format
  isValidToken: (token: string): boolean => {
    return /^[a-f0-9]{64}$/.test(token);
  },

  // Validar UUID
  isValidUUID: (uuid: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  },
};

