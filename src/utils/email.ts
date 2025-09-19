import nodemailer, { Transporter } from 'nodemailer';

type SendParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM = SMTP_USER || 'noreply@example.com',
  FRONTEND_URL = 'https://www.betforbes.com',
} = process.env;

let transporter: Transporter | null = null;

function bool(v: string | undefined): boolean {
  return String(v).toLowerCase() === 'true';
}

function baseUrl(): string {
  return (FRONTEND_URL || 'https://www.betforbes.com').replace(/\/+$/, '');
}

function tokenToVerifyLink(token: string): string {
  return `${baseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
}

function tokenToResetLink(token: string): string {
  return `${baseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

function ensureTransport(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: bool(SMTP_SECURE), // true=465, false=587
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  // Não derruba a app se falhar; apenas loga
  transporter.verify().then(
    () => console.info('info: Serviço de email configurado com sucesso'),
    (err) => console.warn('warn: Falha ao verificar serviço de email:', err?.message || err)
  );

  return transporter;
}

export async function sendMail({ to, subject, html, text }: SendParams): Promise<void> {
  const tx = ensureTransport();
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

/* =========================
 * TEMPLATES
 * ========================= */

export function buildVerificationEmailHtml(link: string): string {
  return `
<!doctype html>
<html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Verifique seu email</title></head>
  <body style="font-family:Arial,Helvetica,sans-serif;background:#fafafa;padding:24px;color:#222;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:10px;padding:24px;">
      <h2 style="margin:0 0 12px 0;">Confirmar endereço de email</h2>
      <p>Olá! Clique no botão abaixo para confirmar seu endereço de email e ativar sua conta.</p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0d6efd;color:#fff;text-decoration:none;font-weight:bold">
          Confirmar email
        </a>
      </p>
      <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
      <p style="word-break:break-all;"><a href="${link}">${link}</a></p>
      <p><strong>Este link expira em 1 hora por segurança.</strong></p>
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
      <p>Se você não solicitou, ignore este email.</p>
      <p style="word-break:break-all;"><a href="${link}">${link}</a></p>
      <p><strong>O link expira em 1 hora por segurança.</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
      <p style="font-size:12px;color:#666;">Proteja sua conta e não compartilhe este link.</p>
    </div>
  </body>
</html>
`.trim();
}

/* =========================
 * OVERLOADS COMPATÍVEIS
 * ========================= */

/**
 * sendVerificationEmail:
 *  - Forma nova: sendVerificationEmail(to, link) -> Promise<boolean>
 *  - Compatível com legado: sendVerificationEmail(to, subject, linkOuTokenOuHtml)
 */
export function sendVerificationEmail(to: string, link: string): Promise<boolean>;
export function sendVerificationEmail(to: string, subject: string, linkOrTokenOrHtml: string): Promise<boolean>;
export async function sendVerificationEmail(to: string, a: string, b?: string): Promise<boolean> {
  let subject: string;
  let html: string;

  if (b === undefined) {
    // Nova assinatura: (to, link)
    subject = 'Confirme seu email — BetForbes';
    html = buildVerificationEmailHtml(a);
  } else {
    // Legado: (to, subject, link/token/html)
    subject = a;
    if (/^https?:\/\//i.test(b)) {
      html = buildVerificationEmailHtml(b); // já é link
    } else if (b.startsWith('<!doctype') || b.includes('<html')) {
      html = b; // já é HTML pronto
    } else {
      // token puro
      html = buildVerificationEmailHtml(tokenToVerifyLink(b));
    }
  }

  try {
    await sendMail({ to, subject, html });
    return true;
  } catch (err: any) {
    console.warn('warn: Falha ao enviar email de verificação:', err?.message || err);
    return false;
  }
}

/**
 * sendPasswordResetEmail:
 *  - Forma nova: sendPasswordResetEmail(to, link) -> Promise<boolean>
 *  - Compatível com legado: sendPasswordResetEmail(to, subject, linkOuTokenOuHtml)
 */
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
    console.warn('warn: Falha ao enviar email de reset:', err?.message || err);
    return false;
  }
}

/**
 * Export default + named (compatível com import default e import nomeado)
 */
const email = {
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  buildVerificationEmailHtml,
  buildResetPasswordEmailHtml,
};

export default email;
