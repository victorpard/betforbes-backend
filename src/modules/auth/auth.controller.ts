import { Request, Response } from 'express';
import authService, {
  RegisterData,
  LoginData,
} from './auth.service';
import { logger } from '../../utils/logger';

export async function register(req: Request, res: Response) {
  const { name, email, password, confirmPassword, referralCode } = req.body;

  logger.info('[CONTROLLER][REGISTER] payload:', {
    name,
    email,
    referralCode,
  });

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Campos obrigatórios ausentes',
      code: 'MISSING_FIELDS',
      timestamp: new Date().toISOString(),
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Passwords não conferem',
      code: 'PASSWORD_MISMATCH',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const result = await authService.register({
      name,
      email,
      password,
      referralCode,
    } as RegisterData);

    return res.json({
      success: true,
      user: result.user,
      emailSent: result.emailSent,
    });
  } catch (err: any) {
    logger.error('[CONTROLLER][REGISTER] erro:', err);
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || 'Erro no registro',
      code: err.code || 'REGISTER_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  logger.info('[CONTROLLER][LOGIN] tentativa para:', { email });

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios',
      code: 'MISSING_CREDENTIALS',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const authResult = await authService.login({ email, password } as LoginData);
    return res.json({
      success: true,
      ...authResult,
    });
  } catch (err: any) {
    logger.error('[CONTROLLER][LOGIN] erro:', err);
    return res.status(err.status || 401).json({
      success: false,
      message: err.message || 'Falha no login',
      code: err.code || 'LOGIN_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  logger.info('[CONTROLLER][VERIFY_EMAIL] token recebido:', token);

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token de verificação ausente',
      code: 'MISSING_TOKEN',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const { user } = await authService.verifyEmail(token);
    return res.json({
      success: true,
      user,
    });
  } catch (err: any) {
    logger.error('[CONTROLLER][VERIFY_EMAIL] erro:', err);
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || 'Falha ao verificar email',
      code: err.code || 'VERIFY_EMAIL_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body;

  logger.info('[CONTROLLER][RESEND_VERIFICATION] para:', { email });

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório',
      code: 'MISSING_EMAIL',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const { emailSent } = await authService.resendVerification(email);
    return res.json({
      success: true,
      emailSent,
    });
  } catch (err: any) {
    logger.error('[CONTROLLER][RESEND_VERIFICATION] erro:', err);
    return res.status(err.status || 400).json({
      success: false,
      message: err.message || 'Falha ao reenviar verificação',
      code: err.code || 'RESEND_VERIFICATION_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
}
