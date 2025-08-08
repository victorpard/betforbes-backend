import { User } from '@prisma/client';
export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
declare class JWTService {
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    constructor();
    generateTokenPair(user: Pick<User, 'id' | 'email' | 'role'>): TokenPair;
    verifyAccessToken(token: string): JWTPayload;
    verifyRefreshToken(token: string): JWTPayload;
    refreshAccessToken(refreshToken: string): string;
    extractTokenFromHeader(authHeader?: string): string | null;
}
declare const _default: JWTService;
export default _default;
//# sourceMappingURL=jwt.d.ts.map