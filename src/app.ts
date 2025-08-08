import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiter } from './middlewares/rateLimiter';
import apiRouter from './routes'; // certifique-se de que em src/routes/index.ts há: export default router;

const app = express();
app.use("/api/auth/profile", (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ success: false, code: "UNAUTHORIZED" });
  return;
  }
  next();
});

// configurações básicas de segurança e parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json());
app.use(morgan('tiny'));

// aplicar rate limiter globalmente
app.use(rateLimiter);

// todas as rotas da API sob /api
app.use('/api', apiRouter);

// tratador de erros deve vir por último
app.use(errorHandler);

export default app;
