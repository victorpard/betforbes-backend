import Joi from 'joi';
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const forgotPasswordSchema: Joi.ObjectSchema<any>;
export declare const resetPasswordSchema: Joi.ObjectSchema<any>;
export declare const resendVerificationSchema: Joi.ObjectSchema<any>;
export declare const refreshTokenSchema: Joi.ObjectSchema<any>;
export declare const logoutSchema: Joi.ObjectSchema<any>;
export declare const updateProfileSchema: Joi.ObjectSchema<any>;
export declare const changePasswordSchema: Joi.ObjectSchema<any>;
export declare const customValidations: {
    emailExists: (email: string) => Promise<boolean>;
    passwordStrength: (password: string) => {
        score: number;
        feedback: string[];
    };
    isValidToken: (token: string) => boolean;
    isValidUUID: (uuid: string) => boolean;
};
//# sourceMappingURL=auth.validation.d.ts.map