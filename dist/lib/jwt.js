"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTService {
    accessTokenSecret;
    refreshTokenSecret;
    accessTokenExpiry;
    refreshTokenExpiry;
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET || 'fallback-secret';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
        this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    }
    generateTokenPair(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const signOptions = {
            expiresIn: this.accessTokenExpiry,
        };
        const refreshSignOptions = {
            expiresIn: this.refreshTokenExpiry,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, signOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, refreshSignOptions);
        return { accessToken, refreshToken };
    }
    verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
        }
        catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
        }
        catch (error) {
            throw new Error('Refresh token inválido ou expirado');
        }
    }
    refreshAccessToken(refreshToken) {
        const payload = this.verifyRefreshToken(refreshToken);
        const { iat, exp, ...userPayload } = payload;
        const signOptions = {
            expiresIn: this.accessTokenExpiry,
        };
        return jsonwebtoken_1.default.sign(userPayload, this.accessTokenSecret, signOptions);
    }
    extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
}
exports.default = new JWTService();
//# sourceMappingURL=jwt.js.map