import { authMiddleware } from '../middlewares/auth';
import { Router } from 'express';
// Importa diretamente o router definido em auth.controller.ts
import authControllerRouter from '../modules/auth/auth.controller';

const router = Router();

// Todas as rotas de /api/auth/* são delegadas ao router do módulo
router.use('/', authControllerRouter);

export default router;
