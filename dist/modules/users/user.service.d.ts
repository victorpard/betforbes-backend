export interface UpdateProfileData {
    name?: string;
    phone?: string;
    birthDate?: string;
}
declare class UserService {
    getProfile(userId: string): Promise<{
        balance: number;
        name: string;
        id: string;
        email: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        referralCode: string | null;
    }>;
    updateProfile(userId: string, updateData: UpdateProfileData): Promise<{
        balance: number;
        name: string;
        id: string;
        email: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        referralCode: string | null;
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
        name: string;
        id: string;
        email: string;
        isVerified: boolean;
        isActive: boolean;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        phone: string | null;
        birthDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        referralCode: string | null;
        referrer: {
            name: string;
            email: string;
        } | null;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map