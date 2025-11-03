import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index';

const app = express();

// middlewares básicos
app.use(helmet({
  contentSecurityPolicy: false, // já está vindo via headers fixos
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// todas as rotas ficam sob /api
app.use('/api', routes);

// 404 handler simples (deixa os módulos tratarem os seus 404s também)
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' });
});

export default app;
