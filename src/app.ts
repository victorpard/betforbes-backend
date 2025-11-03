import routes from "./routes/index";
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));

// Healthcheck (antes de montar /api e do 404)
app.get('/api/health', (_req, res) => res.status(200).send('OK'));

// Monta todas as rotas da API
app.use('/api', routes);

// 404 final
app.use((_req, res) => res.status(404).send('Not Found'));

export default app;
