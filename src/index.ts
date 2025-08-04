console.log('STARTUP TRACE');
import app from './app';
import { logger } from './utils/logger'; // se você usa logger centralizado

const port = process.env.PORT || 3001;

// Log da URL do banco usada em runtime (diagnóstico)
console.log('[BOOT] DATABASE_URL (runtime):', process.env.DATABASE_URL);
if (typeof (global as any).logger !== 'undefined' && (global as any).logger.info) { (global as any).logger.info('[BOOT] DATABASE_URL (runtime):', { databaseUrl: process.env.DATABASE_URL }); }
logger?.info?.('[BOOT] DATABASE_URL (runtime):', { databaseUrl: process.env.DATABASE_URL });

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  logger?.info?.(`Servidor rodando na porta ${port}`);
});
