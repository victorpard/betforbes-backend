import { Router } from 'express';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import referralRoutes from './referral.routes';

// v2 unificado (casts UUID=UUID e response retrocompat)
import affiliatesV2Routes from './affiliates.v2.routes';

const router = Router();

// auth e demais rotas já existentes
router.use('/auth', authRoutes);
router.use('/market', marketRoutes);
router.use('/referral', referralRoutes);

// ===== Afiliados =====
// Mantemos /aff-v2 explícito (debug)
router.use('/aff-v2', affiliatesV2Routes);

// Para não quebrar NENHUMA UI existente, montamos o mesmo handler v2 nas rotas antigas:
router.use('/affiliate', affiliatesV2Routes);   // singular legado
router.use('/affiliates', affiliatesV2Routes); // plural legado

export default router;
