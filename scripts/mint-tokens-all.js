const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) { console.error('JWT_SECRET ausente'); process.exit(1); }

  const usersCsv = '/opt/betforbes/backend/load/users.csv';
  if (!fs.existsSync(usersCsv)) { console.error('users.csv não encontrado'); process.exit(1); }

  const emails = fs.readFileSync(usersCsv, 'utf8')
    .split('\n').map(l => l.trim()).filter(Boolean)
    .map(l => l.split(',')[0]);

  // remover duplicados
  const uniqEmails = [...new Set(emails)];
  const prisma = new PrismaClient();

  try {
    // Busca ids e roles dos e-mails
    const rows = await prisma.user.findMany({
      where: { email: { in: uniqEmails } },
      select: { id: true, email: true, role: true },
    });
    const byEmail = new Map(rows.map(r => [r.email, r]));
    let ok = 0;

    for (const email of uniqEmails) {
      const u = byEmail.get(email);
      if (!u) continue; // usuário não existe
      const payload = { userId: u.id, email: u.email, role: u.role || 'USER' };
      const token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn: '24h',
        jwtid: randomUUID(),
      });
      process.stdout.write(`${email},${token}\n`);
      ok++;
    }
    console.error(`emitidos: ${ok}/${uniqEmails.length}`);
  } catch (e) {
    console.error('Erro:', e && e.message ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
