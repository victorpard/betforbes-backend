import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton do Prisma Client
const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

/**
 * Instala a guarda de segurança apenas uma vez por instância.
 * Evita duplicar middleware em hot-reloads/reenvelopes.
 */
const GUARD = Symbol.for('prisma.referredByGuardInstalled');

if (!(prisma as any)[GUARD]) {
  prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
    if (params.model === 'User') {
      // Nunca aceitar alteração de referredBy em UPDATE / UPDATE MANY
      if (params.action === 'update' || params.action === 'updateMany') {
        if (params.args?.data && Object.prototype.hasOwnProperty.call(params.args.data, 'referredBy')) {
          delete (params.args.data as any).referredBy;
        }
      }

      // Em UPSERT, bloqueia no bloco "update" (permite no "create")
      if (params.action === 'upsert') {
        if (params.args?.update && Object.prototype.hasOwnProperty.call(params.args.update, 'referredBy')) {
          delete (params.args.update as any).referredBy;
        }
      }
    }

    return next(params);
  });

  (prisma as any)[GUARD] = true;
}

// Em dev, reaproveita a instância para evitar muitos clients abertos
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
