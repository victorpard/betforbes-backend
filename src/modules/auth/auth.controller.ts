import { Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';

import authService from './auth.service';
import { asyncHandler } from '../../middlewares/errorHandler';
import logger from '../../utils/logger';
import { getClientIP } from '../../utils/helpers';
import { getReferralFromRequest } from '../../utils/referral'; // <<< usa o helper centralizado

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.validation';

const router = Router();

type JwtPayload = {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
};

function getBearerToken(req: Request): string | null {
  const h = req.headers.authorization || '';
  if (!h || !h.toLowerCase().startsWith('bearer ')) return null;
  return h.slice(7).trim();
}

function requireSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error('JWT_SECRET não configurado nas variáveis de ambiente.');
    throw new Error('JWT_SECRET ausente');
  }
  return secret;
}

function signJwt(
  payload: object,
  envKey: 'JWT_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN',
  fallback: string
): string {
  const secret = requireSecret();
  const expiresIn = process.env[envKey] ?? fallback;
  return (jwt as any).sign(payload, secret, { expiresIn });
}

function signAccessToken(payload: { userId: string; email: string; role?: string }): string {
  return signJwt(payload, 'JWT_EXPIRES_IN', '7d');
}

function signRefreshToken(payload: { userId: string; email: string; role?: string }): string {
  return signJwt(payload, 'JWT_REFRESH_EXPIRES_IN', '30d');
}

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = registerSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
      referralCode?: string;
      confirmPassword?: string;
    };

    // prioridade centralizada: body > cookie (bf_ref) > query (?ref=)
    // o helper já normaliza (ignora "", "null", "undefined" e faz .toUpperCase())
    const effectiveReferralCode = getReferralFromRequest(req); // string | undefined

    const ipAddress = getClientIP(req);

    // monta payload para o service; não envia referralCode se undefined
    const data: any = { name, email, password };
    if (effectiveReferralCode) data.referralCode = effectiveReferralCode;

    const result: any = await authService.register(data);

    logger.info(
      `📝 Registro: ${email} (IP ${ipAddress})` +
        (effectiveReferralCode ? ` com referralCode=${effectiveReferralCode}` : ' sem referralCode')
    );

    return res.status(201).json({
      success: true,
      message: 'Conta criada. Verifique seu e-mail para confirmar.',
      ...result,
    });
  })
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = loginSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { email, password } = req.body as { email: string; password: string };
    const ipAddress = getClientIP(req);

    const loginRes: any = await authService.login({ email, password });

    // normaliza campos vindos do service
    let accessToken: string | null =
      loginRes?.accessToken ?? loginRes?.token ?? loginRes?.jwt ?? null;

    let refreshToken: string | null = loginRes?.refreshToken ?? loginRes?.rt ?? null;

    const user = loginRes?.user ?? loginRes?.profile ?? loginRes?.data?.user ?? null;

    if (!user || !user.id || !user.email) {
      return res
        .status(500)
        .json({ success: false, message: 'Resposta de login inválida: usuário ausente.' });
    }

    const payload: { userId: string; email: string; role?: string } = {
      userId: user.id,
      email: user.email,
    };
    if (user.role) payload.role = user.role;

    // fallback para tokens caso o service não gere
    try {
      if (!accessToken) accessToken = signAccessToken(payload);
      if (!refreshToken) refreshToken = signRefreshToken(payload);
    } catch {
      return res
        .status(500)
        .json({ success: false, message: 'Falha ao gerar token. Verifique JWT_SECRET.' });
    }

    logger.info(`🔐 Login: ${email} (IP ${ipAddress})`);

    return res.json({
      success: true,
      token: accessToken, // compat com clientes antigos
      accessToken,
      refreshToken,
      user,
      // compat com clientes que esperam data.tokens.*
      data: { tokens: { accessToken, refreshToken } },
    });
  })
);

/**
 * POST /api/auth/verify-email
 * body: { token }
 */
router.post(
  '/verify-email',
  asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token de verificação ausente.' });
    }
    await authService.verifyEmail(token);
    return res.json({ success: true, message: 'E-mail verificado com sucesso.' });
  })
);

/**
 * POST /api/auth/resend-verification
 * body: { email }
 */
router.post(
  '/resend-verification',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = resendVerificationSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { email } = req.body as { email: string };
    await authService.resendVerification(email);
    return res.json({ success: true, message: 'E-mail de verificação reenviado.' });
  })
);

/**
 * POST /api/auth/forgot-password
 * body: { email }
 */
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { email } = req.body as { email: string };
    await authService.forgotPassword(email);
    return res.json({ success: true, message: 'Se o e-mail existir, enviaremos instruções.' });
  })
);

/**
 * POST /api/auth/reset-password
 * body: { token, password }
 */
router.post(
  '/reset-password',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = resetPasswordSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { token, password } = req.body as { token: string; password: string };
    await authService.resetPassword(token, password);
    return res.json({ success: true, message: 'Senha redefinida com sucesso.' });
  })
);

/**
 * POST /api/auth/refresh
 * body: { refreshToken }
 */
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = refreshTokenSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { refreshToken } = req.body as { refreshToken: string };

    // tenta via service
    const r: any = await authService.refreshToken(refreshToken);
    let newAccessToken: string | null = r?.accessToken ?? r?.token ?? r?.jwt ?? null;
    let newRefreshToken: string | null = r?.refreshToken ?? null;

    // fallback: se o service não retornar, valida o RT e reemite
    if (!newAccessToken) {
      const secret = requireSecret();
      try {
        const decoded = (jwt as any).verify(refreshToken, secret) as JwtPayload;
        const payload: { userId: string; email: string; role?: string } = {
          userId: decoded.userId,
          email: decoded.email,
        };
        if (decoded.role) payload.role = decoded.role;
        newAccessToken = signAccessToken(payload);
        if (!newRefreshToken) newRefreshToken = signRefreshToken(payload);
      } catch {
        return res.status(401).json({ success: false, message: 'Refresh token inválido ou expirado.' });
      }
    }

    return res.json({
      success: true,
      token: newAccessToken,                    // compat antigo
      accessToken: newAccessToken,              // compat antigo
      refreshToken: newRefreshToken,            // compat antigo
      data: { tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } }, // novo
    });
  })
);

/**
 * POST /api/auth/logout
 * body: { refreshToken }
 */
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const { error: vErr } = logoutSchema.validate(req.body, { abortEarly: false });
    if (vErr) {
      const message = vErr.details.map((d) => d.message).join(' ');
      return res.status(400).json({ success: false, message });
    }

    const { refreshToken } = req.body as { refreshToken: string };
    await authService.logout(refreshToken);
    return res.json({ success: true, message: 'Logout efetuado.' });
  })
);

/**
 * GET /api/auth/validate
 * Valida o JWT (Authorization: Bearer <token>) e retorna dados básicos.
 */
router.get(
  '/validate',
  asyncHandler(async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token ausente.' });
    }

    const secret = requireSecret();

    try {
      const decoded = (jwt as any).verify(token, secret) as JwtPayload;
      return res.json({
        success: true,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role ?? 'USER',
        },
      });
    } catch {
      return res.status(401).json({ success: false, message: 'Token inválido ou expirado.' });
    }
  })
);

export default router;

