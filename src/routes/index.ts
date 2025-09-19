import { microcache } from '../middlewares/microcache';
import { Router, Request, Response } from 'express';

import { authenticateToken } from '../middlewares/auth';

import authRoutes from './auth';
import marketRoutes from './market.routes';
import healthRoutes from './health.routes'; // <-- público
import affiliateRoutes from '../modules/affiliates/affiliate.routes'; // <-- protegido

const router = Router();

// Health checks (público): /api/health e /api/healthz
router.use('/', healthRoutes);

// Auth (público): /api/auth/*
router.use('/auth', authRoutes);

// Market (ajuste conforme necessidade: aqui mantido público)
router.use('/market', marketRoutes);

// Afiliados (PROTEGIDO): /api/affiliate/*
router.use('/affiliate', authenticateToken, affiliateRoutes);

export default router;
