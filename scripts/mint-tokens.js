const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const fs = require('fs');

(async () => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET ausente no ambiente');

    const missingPath = '/opt/betforbes/backend/load/missing.txt';
    if (!fs.existsSync(missingPath)) throw new Error('missing.txt não encontrado');
    const missing = fs.readFileSync(missingPath, 'utf8')
      .split('\n').map(s => s.trim()).filter(Boolean);

    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({
      where: { email: { in: missing } },
      select: { id: true, email: true, role: true },
    });

    const byEmail = new Map(users.map(u => [u.email, u]));
    let ok = 0;

    for (const email of missing) {
      const u = byEmail.get(email);
      if (!u) continue;
      const payload = {
        userId: u.id,
        email: u.email,
        role: u.role || 'USER',
      };
      const token = jwt.sign(payload, secret, {
        algorithm: 'HS256',
        expiresIn: '24h',         // ajuste se quiser '7d'
        jwtid: randomUUID(),
      });
      // saída CSV: email,token
      process.stdout.write(`${email},${token}\n`);
      ok++;
    }
    console.error(`emitidos: ${ok}`);
    await prisma.$disconnect();
  } catch (err) {
    console.error('Erro:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
