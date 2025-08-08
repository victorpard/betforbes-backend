"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = __importDefault(require("./logger"));
const parseBool = (val, def = false) => {
    const s = String(val ?? '').trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(s))
        return true;
    if (['false', '0', 'no', 'off'].includes(s))
        return false;
    return def;
};
class EmailService {
    transporter;
    isConfigured = false;
    emailEnabled = parseBool(process.env.EMAIL_ENABLED, true);
    constructor() {
        this.setupTransporter();
    }
    setupTransporter() {
        if (!this.emailEnabled) {
            this.isConfigured = false;
            logger_1.default.warn('⚠️ EMAIL_ENABLED=false — serviço de email desativado; nenhum email será enviado');
            return;
        }
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || '587', 10);
        const secure = parseBool(process.env.SMTP_SECURE, port === 465);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        this.isConfigured = Boolean(host && user && pass);
        if (!this.isConfigured) {
            logger_1.default.warn('⚠️ Serviço de email não configurado (verifique SMTP_HOST/USER/PASS) — emails não serão enviados');
            return;
        }
        try {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure,
                auth: { user, pass },
            });
            logger_1.default.info('📧 Serviço de email configurado com sucesso');
        }
        catch (error) {
            logger_1.default.error('❌ Erro ao configurar serviço de email:', error);
            this.isConfigured = false;
        }
    }
    async sendEmail(options) {
        if (!this.emailEnabled) {
            logger_1.default.warn('📪 EMAIL_ENABLED=false — pulando envio', {
                to: options.to,
                subject: options.subject,
            });
            return true;
        }
        if (!this.isConfigured || !this.transporter) {
            logger_1.default.warn('📧 Email não enviado (serviço não configurado)', {
                to: options.to,
                subject: options.subject,
            });
            return false;
        }
        const from = process.env.MAIL_FROM ||
            process.env.EMAIL_FROM ||
            'BetForbes <noreply@betforbes.com>';
        try {
            const info = await this.transporter.sendMail({
                from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });
            logger_1.default.info('📧 Email enviado com sucesso', {
                to: options.to,
                subject: options.subject,
                messageId: info?.messageId,
                response: info?.response,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('❌ Erro ao enviar email', {
                to: options.to,
                subject: options.subject,
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    async sendVerificationEmail(email, name, token) {
        const base = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verificationUrl = `${base}/verify-email?token=${token}`;
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
    async sendPasswordResetEmail(email, name, token) {
        const base = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${base}/reset-password?token=${token}`;
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
    isReady() {
        return this.emailEnabled && this.isConfigured;
    }
}
exports.default = new EmailService();
//# sourceMappingURL=email.js.map