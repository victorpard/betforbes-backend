import nodemailer from 'nodemailer';
import { logger } from './logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      this.isConfigured = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      );

      if (this.isConfigured) {
        logger.info('📧 Serviço de email configurado com sucesso');
      } else {
        logger.warn('⚠️  Serviço de email não configurado - emails não serão enviados');
      }
    } catch (error) {
      logger.error('❌ Erro ao configurar serviço de email:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Envia um email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn(`📧 Email não enviado (serviço não configurado): ${options.subject} para ${options.to}`);
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'BetForbes <noreply@betforbes.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`📧 Email enviado com sucesso: ${options.subject} para ${options.to}`);
      return true;
    } catch (error) {
      logger.error(`❌ Erro ao enviar email para ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Envia email de verificação
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificação de Email - BetForbes</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e1e1e; color: #FFD700; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 BetForbes</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Bem-vindo ao BetForbes! Para completar seu cadastro, precisamos verificar seu endereço de email.</p>
            <p>Clique no botão abaixo para verificar sua conta:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verificar Email</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">
              ${verificationUrl}
            </p>
            <p><strong>Este link expira em 24 horas.</strong></p>
            <p>Se você não criou uma conta no BetForbes, pode ignorar este email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 BetForbes. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Olá, ${name}!
      
      Bem-vindo ao BetForbes! Para completar seu cadastro, acesse o link abaixo:
      ${verificationUrl}
      
      Este link expira em 24 horas.
      
      Se você não criou uma conta no BetForbes, pode ignorar este email.
    `;

    return this.sendEmail({
      to: email,
      subject: '🎯 Verificação de Email - BetForbes',
      html,
      text,
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recuperação de Senha - BetForbes</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e1e1e; color: #FFD700; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 BetForbes</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no BetForbes.</p>
            <div class="warning">
              <strong>⚠️ Importante:</strong> Se você não solicitou esta alteração, ignore este email. Sua senha permanecerá inalterada.
            </div>
            <p>Para redefinir sua senha, clique no botão abaixo:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            <p><strong>Este link expira em 1 hora por segurança.</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2024 BetForbes. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Olá, ${name}!
      
      Recebemos uma solicitação para redefinir a senha da sua conta no BetForbes.
      
      Para redefinir sua senha, acesse o link abaixo:
      ${resetUrl}
      
      Este link expira em 1 hora por segurança.
      
      Se você não solicitou esta alteração, ignore este email.
    `;

    return this.sendEmail({
      to: email,
      subject: '🔐 Recuperação de Senha - BetForbes',
      html,
      text,
    });
  }

  /**
   * Verifica se o serviço está configurado
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

export default new EmailService();

