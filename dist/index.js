"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('STARTUP TRACE');
const app_1 = __importDefault(require("./app"));
const logger_1 = require("./utils/logger"); // se você usa logger centralizado
const port = process.env.PORT || 3001;
// Log da URL do banco usada em runtime (diagnóstico)
console.log('[BOOT] DATABASE_URL (runtime):', process.env.DATABASE_URL);
if (typeof global.logger !== 'undefined' && global.logger.info) {
    global.logger.info('[BOOT] DATABASE_URL (runtime):', { databaseUrl: process.env.DATABASE_URL });
}
logger_1.logger?.info?.('[BOOT] DATABASE_URL (runtime):', { databaseUrl: process.env.DATABASE_URL });
app_1.default.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
    logger_1.logger?.info?.(`Servidor rodando na porta ${port}`);
});
