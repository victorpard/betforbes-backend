// scripts/qa-funnel.js
/*  QA Funil (DB triggers):
    - Cria afiliador (isVerified=true)  -> signup_created
    - Cria convidado (isVerified=false)-> signup_created
    - Verifica convidado               -> email_verified
    - Vincula convidado ao afiliador   -> ref_linked
*/
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function uniq(prefix) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

(async () => {
  const now = new Date();
  const affEmail = `${uniq('aff_trg')}@example.com`;
  const guestEmail = `${uniq('guest_trg')}@example.com`;

  console.log('--- QA Funil: iniciando ---');
  console.log({ affEmail, guestEmail });

  // 1) Afiliador já verificado (dispara signup_created)
  const aff = await prisma.user.create({
    data: {
      email: affEmail,
      name: 'Aff TRG',
      password: 'dummy-hash',
      isVerified: true,
      role: 'USER',
      balance: 0,
      createdAt: now,
      updatedAt: now,
    },
    select: { id: true, email: true },
  });

  // 2) Convidado não verificado (dispara signup_created)
  const guest = await prisma.user.create({
    data: {
      email: guestEmail,
      name: 'Guest TRG',
      password: 'dummy-hash',
      isVerified: false,
      role: 'USER',
      balance: 0,
      createdAt: now,
      updatedAt: now,
    },
    select: { id: true, email: true, isVerified: true },
  });

  // 3) Verifica convidado (dispara email_verified)
  await prisma.user.update({
    where: { id: guest.id },
    data: { isVerified: true, updatedAt: new Date() },
  });

  // 4) Vincula convidado ao afiliador (dispara ref_linked)
  await prisma.user.update({
    where: { id: guest.id },
    data: { referredById: aff.id, updatedAt: new Date() },
  });

  // 5) Mostra contagem dos últimos 10 minutos (direto na FunnelEvent)
  const rows = await prisma.$queryRawUnsafe(`
    SELECT kind, COUNT(*)::int AS qty
    FROM "FunnelEvent"
    WHERE "createdAt" > NOW() - INTERVAL '10 minutes'
    GROUP BY kind
    ORDER BY kind;
  `);

  console.log('\n--- Eventos (últimos 10 min) ---');
  console.table(rows);

  console.log('\n--- Dicas de verificação ---');
  console.log(`Local JSON:  curl -sS 'http://127.0.0.1:3001/api/ops/funnel?range=30d' -H "X-OPS-Token: $OPS" | jq .`);
  console.log(`Local CSV:   curl -sS 'http://127.0.0.1:3001/api/ops/affiliates/report?range=30d&format=csv' -H "X-OPS-Token: $OPS" | head -n5`);
  console.log(`Nuvem JSON:  curl -sS 'https://betforbes.com/api/ops/funnel?range=30d' -H "X-OPS-Token: $OPS" | jq .`);
  console.log(`Nuvem CSV:   curl -sS 'https://betforbes.com/api/ops/affiliates/report?range=30d&format=csv' -H "X-OPS-Token: $OPS" | head -n5`);
  console.log('\n--- QA concluído ---');

  await prisma.$disconnect();
})().catch(async (e) => {
  console.error('QA erro:', e);
  await prisma.$disconnect();
  process.exit(1);
});
