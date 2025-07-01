"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const auth_1 = require("./middlewares/auth");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const logger_1 = require("./utils/logger");
const prisma_1 = __importDefault(require("./lib/prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
app.set('trust proxy', true);
logger_1.logger.debug({
    rateLimiter: rateLimiter_1.rateLimiter,
    authenticateToken: auth_1.authenticateToken,
    authRoutes: auth_routes_1.default,
    userRoutes: user_routes_1.default,
});
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter_1.rateLimiter);
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'BetForbes API', version: '1.0.0' },
        servers: [{ url: process.env.API_URL || `http://localhost:${PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/modules/**/*.ts', './src/modules/**/*.routes.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', auth_1.authenticateToken, user_routes_1.default);
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: `Rota não encontrada: ${req.originalUrl}` });
});
app.use((err, _req, res, _next) => {
    (0, errorHandler_1.errorHandler)(err, _req, res, _next);
});
async function startServer() {
    try {
        await prisma_1.default.$connect();
        logger_1.logger.info('Conectado ao banco de dados');
        app.listen(PORT, () => logger_1.logger.info(`Servidor rodando na porta ${PORT}`));
    }
    catch (err) {
        logger_1.logger.error('Erro ao iniciar servidor:', err);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map