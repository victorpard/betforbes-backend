import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL;

if (!url) {
  // falha rápida e clara se faltar variável
  // eslint-disable-next-line no-console
  console.error('FATAL: DATABASE_URL não definido. Verifique o .env e o processo de start.');
  process.exit(1);
}

export const prisma = new PrismaClient({
  datasources: { db: { url } },
  log: process.env.LOG_LEVEL === 'debug'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

export default prisma;
