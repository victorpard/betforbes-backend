"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
class EmailService {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
        void this.setupTransporter();
    }
    async setupTransporter() {
        try {
            const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
            const portStr = process.env.SMTP_PORT || process.env.EMAIL_PORT || "587";
            const port = parseInt(portStr, 10);
            const secure = (process.env.SMTP_SECURE || "false") === "true";
            const user = process.env.SMTP_USER || process.env.EMAIL_USER;
            const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
            if (!host || !user || !pass) {
                this.isConfigured = false;
                logger_1.logger.warn("⚠️ Serviço de email não configurado - falta HOST/USER/PASS");
                return;
            }
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure, // true = TLS, false = STARTTLS
                auth: { user, pass },
            });
            try {
                await this.transporter.verify();
                this.isConfigured = true;
                logger_1.logger.info("✅ Serviço de email configurado com sucesso e verificado");
            }
            catch (verifyErr) {
                this.isConfigured = false;
                logger_1.logger.error("❌ Falha ao verificar transporte de email:", verifyErr);
            }
        }
        catch (error) {
            logger_1.logger.error("❌ Erro ao configurar serviço de email:", error);
            this.isConfigured = false;
        }
    }
    async sendEmail(options) {
        if (!this.isConfigured || !this.transporter) {
            logger_1.logger.warn(`📨 Email não enviado (serviço não configurado): ${options.subject} para ${options.to}`);
            return false;
        }
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || "BetForbes <noreply@betforbes.com>",
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };
            await this.transporter.sendMail(mailOptions);
            logger_1.logger.info(`📨 Email enviado com sucesso: ${options.subject} para ${options.to}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error(`❌ Erro ao enviar email para ${options.to}:`, error);
            return false;
        }
    }
    async sendVerificationEmail(email, name, token) {
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
            <h1>BetForbes</h1>
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
            subject: "🔐 Verificação de Email - BetForbes",
            html,
            text,
        });
    }
    async sendPasswordResetEmail(email, name, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinição de Senha - BetForbes</title>
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
            <h1>BetForbes</h1>
          </div>
          <div class="content">
            <h2>Olá, ${name}!</h2>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">
              ${resetUrl}
            </p>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou a redefinição, pode ignorar este email.</p>
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

Recebemos uma solicitação para redefinir sua senha.
Acesse o link abaixo para criar uma nova senha:
${resetUrl}

Este link expira em 1 hora.

Se você não solicitou a redefinição, pode ignorar este email.
    `;
        return this.sendEmail({
            to: email,
            subject: "🔒 Redefinição de Senha - BetForbes",
            html,
            text,
        });
    }
}
exports.default = new EmailService();
