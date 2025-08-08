export interface AffiliateStats {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    referralLink: string;
}
export interface ReferralUser {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    createdAt: Date;
}
declare class AffiliateService {
    getReferralLink(userId: string): Promise<{
        referralLink: string;
        referralCode: string;
    }>;
    getAffiliateStats(userId: string): Promise<AffiliateStats>;
    getReferrals(userId: string, page?: number, limit?: number): Promise<{
        referrals: ReferralUser[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
declare const _default: AffiliateService;
export default _default;
//# sourceMappingURL=affiliate.service.d.ts.map