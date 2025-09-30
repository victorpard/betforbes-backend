import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET ausente no ambiente');

  const missing = fs.readFileSync('/opt/betforbes/backend/load/missing.txt','utf8')
                    .split('\n').map(s=>s.trim()).filter(Boolean);

  // Carrega todos de uma vez
  const users = await prisma.user.findMany({
    where: { email: { in: missing } },
    select: { id: true, email: true, role: true },
  });
  const byEmail = new Map(users.map(u => [u.email, u]));

  let ok = 0;
  for (const email of missing) {
    const u = byEmail.get(email);
    if (!u) continue; // usuário pode não existir por algum motivo
    const payload = {
      userId: u.id,
      email: u.email,
      role: u.role || 'USER',
    };
    const token = jwt.sign(payload, secret, {
      algorithm: 'HS256',
      expiresIn: '24h',
      jwtid: randomUUID(),
    });
    console.log(`${email},${token}`);
    ok++;
  }
  console.error(`emitidos: ${ok}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exitCode = 1;
});
