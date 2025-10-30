import affiliateRoutes from '../modules/affiliates/affiliate.routes';
import { authenticateToken } from '../middlewares/auth';
import { Router } from 'express';
import authRoutes from './auth';
import marketRoutes from './market.routes';
// outros imports...

const router = Router();

// prefixa /auth
router.use('/auth', authRoutes);

// Rotas de afiliado
router.use('/affiliate', authenticateToken, affiliateRoutes);
// outras rotas: /market, /users, etc.
router.use('/market', marketRoutes);
// rota de afiliados
router.use('/affiliate', affiliateRoutes);

export default router;
