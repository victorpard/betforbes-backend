import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/utils/helpers';

async function main() {
  // referrer
  const referrerEmail = 'seed_referrer@test.com';
  let referrer = await prisma.user.findUnique({ where: { email: referrerEmail } });
  if (!referrer) {
    const passwordHash = await hashPassword('Senha123!');
    let code: string;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await prisma.user.findUnique({ where: { referralCode: code } }));
    referrer = await prisma.user.create({
      data: {
        name: 'Seed Referrer',
        email: referrerEmail.toLowerCase(),
        password: passwordHash,
        referralCode: code,
        isVerified: true,
        isActive: true,
      },
    });
    await prisma.user.update({
      where: { id: referrer.id },
      data: { emailVerifiedAt: new Date() },
    });
    console.log('Referrer criado:', referrer.email, 'code:', code);
  } else {
    console.log('Referrer já existe:', referrer.email, 'code:', referrer.referralCode);
  }

  // referred
  const referredEmail = 'seed_referred@test.com';
  let referred = await prisma.user.findUnique({ where: { email: referredEmail } });
  if (!referred) {
    const passwordHash = await hashPassword('Senha123!');
    referred = await prisma.user.create({
      data: {
        name: 'Seed Referred',
        email: referredEmail.toLowerCase(),
        password: passwordHash,
        referredBy: referrer!.id,
        referredById: referrer!.id,
        isVerified: true,
        isActive: true,
        referralCode: null,
      },
    });
    await prisma.user.update({
      where: { id: referred.id },
      data: { emailVerifiedAt: new Date() },
    });
    console.log('Referred criado:', referred.email, 'referido por:', referrer!.email);
  } else {
    console.log('Referred já existe:', referred.email);
  }
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
