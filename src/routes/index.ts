
import { Router } from 'express';
import authRoutes from './auth';
// import userRoutes from './users';
// import outros módulos de rota...

const router = Router();

// Todas as rotas de auth ficam em /api/auth/*
router.use('/api/auth', authRoutes);

// Exemplo de outras rotas:
// router.use('/api/users', userRoutes);

export default router;
