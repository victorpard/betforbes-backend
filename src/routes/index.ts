import { Router } from 'express';

import healthRoutes from './health.routes';
import versionRoutes from './version.routes';
import legacyRoutes from './legacy.routes';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import referralRoutes from './referral.routes';
import affiliatesV2Routes from './affiliates.v2.routes';
import userRoutes from '../modules/users/user.routes';

const router = Router();

// canários / diagnósticos
router.use('/health', healthRoutes);
router.use('/version', versionRoutes);

// principais
router.use('/auth', authRoutes);
router.use('/market', marketRoutes);
router.use('/referral', referralRoutes);
router.use('/users', userRoutes);

// afiliados (v2 + aliases legados)
router.use('/aff-v2', affiliatesV2Routes);
router.use('/affiliate', affiliatesV2Routes);   // legado singular
router.use('/affiliates', affiliatesV2Routes);  // legado plural

// aliases legados diversos (/api/profile, /api/me)
router.use('/', legacyRoutes);

export default router;
