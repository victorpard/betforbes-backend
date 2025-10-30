import affiliatesAliasRoutes from './affiliates.alias.routes';
import affiliateRoutes from "./affiliate.routes";
import referralRoutes from "./referral.routes";
// import affiliateRoutes from '../modules/affiliates/affiliate.routes';
import { authenticateToken } from '../middlewares/auth';
import { Router } from 'express';
import authRoutes from './auth';
import marketRoutes from './market.routes';
// outros imports...

const router = Router();

// prefixa /auth
router.use('/auth', authRoutes);
router.use('/referral', referralRoutes);

// Rotas de afiliado
router.use('/affiliates', authenticateToken, affiliatesAliasRoutes);
router.use('/referral', referralRoutes);
// outras rotas: /market, /users, etc.
router.use('/market', marketRoutes);
router.use('/referral', referralRoutes);
// rota de afiliados
router.use('/affiliates', affiliatesAliasRoutes);
router.use('/referral', referralRoutes);

export default router;