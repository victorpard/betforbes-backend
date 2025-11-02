import { Router } from 'express';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import referralRoutes from './referral.routes';

import affiliatesAliasRoutes from './affiliates.alias.routes'; // /api/affiliates/*
import affiliateRoutes from './affiliate.routes';              // /api/affiliate/* (legado)

import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Auth & básicos
router.use('/auth', authRoutes);

// Rotas de afiliados (PLURAL = canário compatível; SINGULAR = legado)
router.use('/affiliates', authenticateToken, affiliatesAliasRoutes);
router.use('/affiliate', authenticateToken, affiliateRoutes);

// Outras rotas já existentes
router.use('/referral', referralRoutes);
router.use('/market', marketRoutes);

export default router;
