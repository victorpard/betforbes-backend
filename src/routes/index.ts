import { Router } from 'express';
import authRoutes from './auth'; // ajustado para apontar para o arquivo de router

const router = Router();

router.use('/auth', authRoutes);

// outras rotas que vierem depois, ex:
// router.use('/users', userRoutes);

export default router;
