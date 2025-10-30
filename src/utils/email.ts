// src/utils/email.ts
import nodemailer, { Transporter } from 'nodemailer';

/**
 * Compatível com:
 *  - EMAIL_* (EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM)
 *  - SMTP_*  (SMTP_HOST,  SMTP_PORT,  SMTP_SECURE,  SMTP_USER,  SMTP_PASS,  EMAIL_FROM)
 * Expirações lidas de:
 *  - EMAIL_VERIFICATION_EXPIRES (ex.: "24h")
 *  - PASSWORD_RESET_EXPIRES     (ex.: "1h")
 * Base URL:
 *  - FRONTEND_URL (p.ex. https://betforbes.com ou https://www.betforbes.com)
 */

type SendParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// ===== Helpers de ENV =====
function pickEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (v != null && v !== '') return v;
  }
  return undefined;
}
function bool(v: string | undefined): boolean {
  return String(v).toLowerCase() === 'true';
}
function secondsFromHuman(s: string | undefined, fallbackSeconds: number): number {
  if (!s) return fallbackSeconds;
  // aceita "1h", "24h", "15m", "900s"
  const m = String(s).trim().match(/^(\d+)\s*([smhdw])?$/i);
  if (!m) return fallbackSeconds;
  const val = Number(m[1]);
  const unit = (m[2] || 's').toLowerCase();
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return val * (map[unit] ?? 1);
}
function humanLabelFromEnv(s: string | undefined, fallback: string): string {
  return s && s.trim() ? s.trim() : fallback;
}

// ===== Config derivada do ENV =====
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, '');

const EMAIL_HOST = pickEnv('EMAIL_HOST', 'SMTP_HOST') || 'smtp.gmail.com';
const EMAIL_PORT = Number(pickEnv('EMAIL_PORT', 'SMTP_PORT') || '587');
const EMAIL_SECURE = bool(pickEnv('EMAIL_SECURE', 'SMTP_SECURE') || 'false');
const EMAIL_USER = pickEnv('EMAIL_USER', 'SMTP_USER');
const EMAIL_PASS = pickEnv('EMAIL_PASS', 'SMTP_PASS');
const EMAIL_FROM = pickEnv('EMAIL_FROM') || EMAIL_USER || 'noreply@example.com';

const VERIF_LABEL = humanLabelFromEnv(process.env.EMAIL_VERIFICATION_EXPIRES, '24h');
const RESET_LABEL = humanLabelFromEnv(process.env.PASSWORD_RESET_EXPIRES, '1h');
// (os labels são apenas textuais para o e-mail; a lógica de expiração real deve ser aplicada no backend)

// ===== Link builders =====
function tokenToVerifyLink(token: string): string {
  return `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
}
function tokenToResetLink(token: string): string {
  return `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
}

// ===== Nodemailer singleton =====
let transporter: Transporter | null = null;

function ensureTransport(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE, // true=465, false=587
    auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
  });

  // Apenas loga o status; não derruba a app se falhar
  transporter.verify().then(
    () => console.info('[email] Serviço de SMTP verificado com sucesso'),
    (err) => console.warn('[email] Falha ao verificar SMTP:', err?.message || err)
  );

  return transporter;
}

// ===== Funções principais =====
export async function sendMail({ to, subject, html, text }: SendParams): Promise<void> {
  // Se não houver host/credenciais, ainda tentamos; caso falhe, cai no catch do chamador
  const tx = ensureTransport();

  // Se não tiver AUTH configurado (ambiente de dev), apenas loga e retorna "como se enviado"
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[email] SMTP sem credenciais configuradas — enviando para console.');
    console.warn(`From: ${EMAIL_FROM}\nTo: ${to}\nSubject: ${subject}\n\n${stripHtml(html)}\n`);
    return;
  }

  await tx.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text: text || stripHtml(html),
    html,
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ===== Templates =====
export function buildVerificationEmailHtml(link: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Verifique seu e-mail</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#fafafa;padding:24px;color:#222;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:10px;padding:24px;">
      <h2 style="margin:0 0 12px 0;">Confirmar endereço de e-mail</h2>
      <p>Olá! Clique no botão abaixo para confirmar seu endereço de e-mail e ativar sua conta.</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0d6efd;color:#fff;text-decoration:none;font-weight:bold">
          Confirmar e-mail
        </a>
      </p>
      <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p style="word-break:break-all;"><a href="${link}">${link}</a></p>
      <p><strong>Este link expira em ${VERIF_LABEL} por segurança.</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#666;">Se você não solicitou este cadastro, ignore esta mensagem.</p>
    </div>
  </body>
</html>
`.trim();
}

export function buildResetPasswordEmailHtml(link: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Redefinição de senha</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#fafafa;padding:24px;color:#222;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:10px;padding:24px;">
      <h2 style="margin:0 0 12px 0;">Redefinir sua senha</h2>
      <p>Recebemos um pedido para redefinir sua senha. Clique no botão abaixo:</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0d6efd;color:#fff;text-decoration:none;font-weight:bold">
          Redefinir senha
        </a>
      </p>
      <p>Se você não solicitou, ignore este e-mail.</p>
      <p style="word-break:break-all;"><a href="${link}">${link}</a></p>
      <p><strong>O link expira em ${RESET_LABEL} por segurança.</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#666;">Proteja sua conta e não compartilhe este link.</p>
    </div>
  </body>
</html>
`.trim();
}

// ===== Overloads compatíveis (legado e novo) =====
export function sendVerificationEmail(to: string, link: string): Promise<boolean>;
export function sendVerificationEmail(to: string, subject: string, linkOrTokenOrHtml: string): Promise<boolean>;
export async function sendVerificationEmail(to: string, a: string, b?: string): Promise<boolean> {
  let subject: string;
  let html: string;

  if (b === undefined) {
    // Nova assinatura: (to, link)
    subject = 'Confirme seu e-mail — BetForbes';
    html = buildVerificationEmailHtml(a);
  } else {
    // Legado: (to, subject, link/token/html)
    subject = a;
    if (/^https?:\/\//i.test(b)) {
      html = buildVerificationEmailHtml(b); // já é link
    } else if (b.startsWith('<!doctype') || b.includes('<html')) {
      html = b; // já é HTML completo
    } else {
      // token puro
      html = buildVerificationEmailHtml(tokenToVerifyLink(b));
    }
  }

  try {
    await sendMail({ to, subject, html });
    return true;
  } catch (err: any) {
    console.warn('[email] Falha ao enviar e-mail de verificação:', err?.message || err);
    return false;
  }
}

export function sendPasswordResetEmail(to: string, link: string): Promise<boolean>;
export function sendPasswordResetEmail(to: string, subject: string, linkOrTokenOrHtml: string): Promise<boolean>;
export async function sendPasswordResetEmail(to: string, a: string, b?: string): Promise<boolean> {
  let subject: string;
  let html: string;

  if (b === undefined) {
    subject = 'Redefinir senha — BetForbes';
    html = buildResetPasswordEmailHtml(a);
  } else {
    subject = a;
    if (/^https?:\/\//i.test(b)) {
      html = buildResetPasswordEmailHtml(b);
    } else if (b.startsWith('<!doctype') || b.includes('<html')) {
      html = b;
    } else {
      html = buildResetPasswordEmailHtml(tokenToResetLink(b));
    }
  }

  try {
    await sendMail({ to, subject, html });
    return true;
  } catch (err: any) {
    console.warn('[email] Falha ao enviar e-mail de reset:', err?.message || err);
    return false;
  }
}

// ===== Export default + named =====
const email = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  buildVerificationEmailHtml,
  buildResetPasswordEmailHtml,
};

export default email;
