import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const total = parseInt(process.argv[2] || '1000', 10);
  const domain = process.argv[3] || 'example.com';
  const password = process.argv[4] || 'pass001!';

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  console.log(`Seeding ${total} users @ ${domain} ...`);
  const batch: any[] = [];
  for (let i = 1; i <= total; i++) {
    const num = String(i).padStart(3, '0');
    const email = `user${num}@${domain}`;
    batch.push(
      prisma.user.upsert({
        where: { email },
        update: {
          password: hash,
          isVerified: true,
          isActive: true,
        },
        create: {
          email,
          name: `User ${num}`,
          password: hash,
          role: 'USER',
          isVerified: true,
          isActive: true,
          balance: 0,
        },
      })
    );

    if (batch.length === 100) {
      await prisma.$transaction(batch.splice(0, batch.length));
      if (i % 100 === 0) console.log(`... ${i} ok`);
    }
  }
  if (batch.length) await prisma.$transaction(batch);

  console.log('Seed concluído ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
