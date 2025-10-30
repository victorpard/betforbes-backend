import { Router } from 'express';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import referralRoutes from './referral.routes';

// Nosso router de afiliados (novo, plural) que já funciona:
import affiliatesAliasRoutes from './affiliates.alias.routes';

// Se você ainda usa o legado em algum lugar, ele pode continuar importado,
// mas não vamos usá-lo para evitar formatos diferentes.
// import affiliateRoutes from "./affiliate.routes";

import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Auth & outros
router.use('/auth', authRoutes);
router.use('/referral', referralRoutes);
router.use('/market', marketRoutes);

// ===== Afiliados =====
// Caminho novo (plural) protegido
router.use('/affiliates', authenticateToken, affiliatesAliasRoutes);
// (opcional) caminho novo sem wrapper extra (mantém compatibilidade com ambientes antigos)
router.use('/affiliates', affiliatesAliasRoutes);

// *** BACK-COMPAT ***
// Mapeia o SINGULAR para os MESMOS handlers do plural,
// garantindo que a UI que ainda chama /api/affiliate/... funcione.
router.use('/affiliate', authenticateToken, affiliatesAliasRoutes);
router.use('/affiliate', affiliatesAliasRoutes);

export default router;
