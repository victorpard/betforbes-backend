export interface RegisterData {
    name: string;
    email: string;
    password: string;
    referralCode?: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AuthResult {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        isVerified: boolean;
        balance: number;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}
declare class AuthService {
    register(data: RegisterData): Promise<{
        user: any;
        emailSent: boolean;
    }>;
    login(data: LoginData): Promise<AuthResult>;
    verifyEmail(token: string): Promise<{
        user: any;
    }>;
    resendVerification(email: string): Promise<{
        emailSent: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        emailSent: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        success: boolean;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map