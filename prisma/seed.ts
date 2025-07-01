import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemConfig.deleteMany();

  console.log('🗑️  Dados existentes removidos');

  // Hash das senhas
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const testPassword = await bcrypt.hash('test123456', 12);

  // Criar usuários
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrador BetForbes',
      email: 'admin@betforbes.com',
      password: adminPassword,
      isVerified: true,
      role: 'ADMIN',
      balance: 1000.0,
      referralCode: 'ADMIN001',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      name: 'Usuário de Teste',
      email: 'test@betforbes.com',
      password: testPassword,
      isVerified: true,
      role: 'USER',
      balance: 100.0,
      referralCode: 'TEST001',
    },
  });

  // Criar usuário não verificado para testes
  const unverifiedUser = await prisma.user.create({
    data: {
      name: 'Usuário Não Verificado',
      email: 'unverified@betforbes.com',
      password: await bcrypt.hash('unverified123', 12),
      isVerified: false,
      role: 'USER',
      balance: 0.0,
      referralCode: 'UNVER001',
    },
  });

  console.log('👥 Usuários criados:');
  console.log(`   Admin: ${adminUser.email} (senha: admin123456)`);
  console.log(`   Teste: ${testUser.email} (senha: test123456)`);
  console.log(`   Não verificado: ${unverifiedUser.email} (senha: unverified123)`);

  // Configurações do sistema
  const systemConfigs = [
    {
      key: 'SITE_NAME',
      value: 'BetForbes',
      type: 'STRING' as const,
    },
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      type: 'BOOLEAN' as const,
    },
    {
      key: 'MAX_BET_AMOUNT',
      value: '10000',
      type: 'NUMBER' as const,
    },
    {
      key: 'MIN_BET_AMOUNT',
      value: '1',
      type: 'NUMBER' as const,
    },
    {
      key: 'EMAIL_VERIFICATION_REQUIRED',
      value: 'true',
      type: 'BOOLEAN' as const,
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({
      data: config,
    });
  }

  console.log('⚙️  Configurações do sistema criadas');

  // Log de auditoria inicial
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SEED_DATABASE',
      resource: 'SYSTEM',
      details: {
        message: 'Banco de dados inicializado com seed',
        usersCreated: 3,
        configsCreated: systemConfigs.length,
      },
    },
  });

  console.log('📝 Log de auditoria criado');
  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

