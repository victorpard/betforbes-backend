export interface UpdateProfileData {
    name?: string;
    phone?: string;
    birthDate?: string;
}
declare class UserService {
    getProfile(userId: string): Promise<{
        balance: number;
        id: string;
        email: string;
        referralCode: string | null;
        name: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    updateProfile(userId: string, updateData: UpdateProfileData): Promise<{
        balance: number;
        id: string;
        email: string;
        referralCode: string | null;
        name: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    getSessions(userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        userAgent: string | null;
        ipAddress: string | null;
    }[]>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
    }>;
    revokeAllSessions(userId: string, currentToken?: string): Promise<number>;
    deleteAccount(userId: string, password: string): Promise<{
        success: boolean;
    }>;
    getUserStats(userId: string): Promise<{
        userId: string;
        balance: number;
        daysSinceRegistration: number;
        lastLoginAt: Date | null;
        activeSessions: number;
        totalBets: number;
        totalWins: number;
        totalDeposits: number;
        totalWithdrawals: number;
    }>;
    canDeleteAccount(userId: string): Promise<{
        canDelete: boolean;
        reasons: string[];
    }>;
    getProfileWithAffiliate(userId: string): Promise<{
        balance: number;
        referredBy: {
            name: string;
            email: string;
        } | null;
        id: string;
        email: string;
        referralCode: string | null;
        name: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        referrer: {
            email: string;
            name: string;
        } | null;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map