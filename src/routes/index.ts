import { Router } from 'express';
import healthRoutes from './health.routes';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import referralRoutes from './referral.routes';

// v2 unificado (casts UUID=UUID e response retrocompat)
import affiliatesV2Routes from './affiliates.v2.routes';

// módulo de usuários (novo caminho correto)
import usersRoutes from '../modules/users/user.routes';

// aliases legados para não quebrar front antigo (/api/profile e /api/me)
import legacyRoutes from './legacy.routes';

const router = Router();

// health primeiro
router.use('/health', healthRoutes);

// aliases legados antes das demais (usam os mesmos handlers do módulo de usuário)
router.use('/', legacyRoutes);

// módulos principais
router.use('/auth', authRoutes);
router.use('/market', marketRoutes);
router.use('/referral', referralRoutes);
router.use('/users', usersRoutes);

// Afiliados: manter plural, singular e v2
router.use('/aff-v2', affiliatesV2Routes);   // explícito para debug
router.use('/affiliate', affiliatesV2Routes); // singular legado
router.use('/affiliates', affiliatesV2Routes); // plural legado

export default router;
