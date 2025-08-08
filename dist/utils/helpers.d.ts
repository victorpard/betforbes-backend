export declare function generateSecureToken(length?: number): string;
export declare function generateReferralCode(length?: number): string;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function getExpirationDate(minutes: number): Date;
export declare function isValidEmail(email: string): boolean;
export declare function isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
};
export declare function sanitizeString(str: string): string;
export declare function formatCurrency(value: number, currency?: string): string;
export declare function generateSlug(text: string): string;
export declare function getClientIP(req: any): string;
export declare function maskEmail(email: string): string;
export declare function delay(ms: number): Promise<void>;
export declare function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
//# sourceMappingURL=helpers.d.ts.map