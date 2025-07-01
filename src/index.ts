import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Middlewares
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import { authenticateToken } from './middlewares/auth';

// Rotas
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
// Bets module removed per request

// Utils
import { logger } from './utils/logger';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Banir proxies inseguros
app.set('trust proxy', true);

// Logs de debug (remova em produção)
logger.debug({
  rateLimiter,
  authenticateToken,
  authRoutes,
  userRoutes,
});

// Middlewares globais
app.use(
  helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title:'BetForbes API', version:'1.0.0' },
    servers:[{ url: process.env.API_URL || `http://localhost:${PORT}` }],
    components:{
      securitySchemes:{
        bearerAuth:{ type:'http', scheme:'bearer', bearerFormat:'JWT' }
      }
    },
    security:[{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/*.ts','./src/modules/**/*.routes.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req: Request, res: Response) => res.json(swaggerSpec));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
// Bets routes removed

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ success:false, message:`Rota não encontrada: ${req.originalUrl}` });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  errorHandler(err, _req, res, _next);
});

// Inicia servidor
async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Conectado ao banco de dados');
    app.listen(PORT, () => logger.info(`Servidor rodando na porta ${PORT}`));
  } catch (err) {
    logger.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
}

startServer();

export default app;
