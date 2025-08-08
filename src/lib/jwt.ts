import jwt, { SignOptions } from 'jsonwebtoken';
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

class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Gera um par de tokens (access + refresh) para um usuário
   */
  generateTokenPair(user: Pick<User, 'id' | 'email' | 'role'>): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const signOptions: any = {
      expiresIn: this.accessTokenExpiry,
    };

    const refreshSignOptions: any = {
      expiresIn: this.refreshTokenExpiry,
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, signOptions);
    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, refreshSignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verifica e decodifica um access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Verifica e decodifica um refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }

  /**
   * Gera um novo access token usando um refresh token válido
   */
  refreshAccessToken(refreshToken: string): string {
    const payload = this.verifyRefreshToken(refreshToken);
    
    // Remove campos de tempo do payload original
    const { iat, exp, ...userPayload } = payload;
    
    const signOptions: any = {
      expiresIn: this.accessTokenExpiry,
    };
    
    return jwt.sign(userPayload, this.accessTokenSecret, signOptions);
  }

  /**
   * Extrai token do header Authorization
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export default new JWTService();

