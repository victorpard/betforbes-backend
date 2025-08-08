"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express_1.default.json());
app.use(rateLimiter_1.rateLimiter);
app.use('/api', routes_1.default);
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Rota não encontrada: ${req.originalUrl}` }));
app.use(errorHandler_1.errorHandler);
async function start() {
    await prisma_1.default.$connect();
    logger_1.default.info('DB Connected');
    app.listen(PORT, () => logger_1.default.info(`Server on port ${PORT}`));
}
start();
//# sourceMappingURL=index.js.map