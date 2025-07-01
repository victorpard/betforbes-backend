import { Request, Response } from 'express';
import authService from './auth.service';
import { asyncHandler } from '@/middlewares/errorHandler';
import { logger } from '@/utils/logger';
import { getClientIP } from '@/utils/helpers';

class AuthController {
  /**
   * Registro de usuário
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, referralCode } = req.body;
    
    const result = await authService.register({
      name,
      email,
      password,
      referralCode,
    });

    logger.info(`📝 Registro realizado: ${email} - IP: ${getClientIP(req)}`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
      data: {
        user: result.user,
        emailSent: result.emailSent,
      },
    });
  });

  /**
   * Login de usuário
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const result = await authService.login({ email, password });

    logger.info(`🔐 Login realizado: ${email} - IP: ${getClientIP(req)}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
    });
  });

  /**
   * Verificação de email
   */
  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação é obrigatório',
        code: 'MISSING_TOKEN',
      });
    }

    const result = await authService.verifyEmail(token);

    logger.info(`✅ Email verificado: ${result.user.email} - IP: ${getClientIP(req)}`);

    return res.json({
      success: true,
      message: 'Email verificado com sucesso!',
      data: result,
    });
  });

  /**
   * Reenvio de verificação de email
   */
  resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    const result = await authService.resendVerification(email);

    logger.info(`📧 Reenvio de verificação: ${email} - IP: ${getClientIP(req)}`);

    res.json({
      success: true,
      message: 'Email de verificação enviado. Verifique sua caixa de entrada.',
      data: result,
    });
  });

  /**
   * Esqueci minha senha
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    
    const result = await authService.forgotPassword(email);

    logger.info(`🔑 Solicitação de recuperação: ${email} - IP: ${getClientIP(req)}`);

    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      data: result,
    });
  });

  /**
   * Redefinir senha
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    
    const result = await authService.resetPassword(token, password);

    logger.info(`🔑 Senha redefinida - IP: ${getClientIP(req)}`);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
      data: result,
    });
  });

  /**
   * Refresh token
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: result,
    });
  });

  /**
   * Logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    const result = await authService.logout(refreshToken);

    logger.info(`👋 Logout realizado - IP: ${getClientIP(req)}`);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      data: result,
    });
  });

  /**
   * Perfil do usuário
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    res.json({
      success: true,
      message: 'Perfil obtido com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  });
}

export default new AuthController();

