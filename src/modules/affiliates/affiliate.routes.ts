import { Router } from 'express';
import affiliateController from './affiliate.controller';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     AffiliateStats:
 *       type: object
 *       properties:
 *         totalReferrals:
 *           type: number
 *           description: Total de usuários referenciados
 *         activeReferrals:
 *           type: number
 *           description: Usuários referenciados ativos (verificados)
 *         totalEarnings:
 *           type: number
 *           description: Total de ganhos em reais
 *         referralLink:
 *           type: string
 *           description: Link único de referência
 *
 *     ReferralUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/affiliates/link:
 *   get:
 *     summary: Obter link único de referência
 *     tags: [Afiliados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Link de referência obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralLink:
 *                       type: string
 *                       example: "https://www.betforbes.com/cadastro?ref=ABC123"
 *                     referralCode:
 *                       type: string
 *                       example: "ABC123"
 */
router.get('/link', authMiddleware, affiliateController.getReferralLink);

/**
 * @swagger
 * /api/affiliates/stats:
 *   get:
 *     summary: Obter estatísticas de afiliados
 *     tags: [Afiliados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AffiliateStats'
 */
router.get('/stats', authMiddleware, affiliateController.getAffiliateStats);

/**
 * @swagger
 * /api/affiliates/referrals:
 *   get:
 *     summary: Listar usuários referenciados
 *     tags: [Afiliados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de referrals obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     referrals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReferralUser'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */
router.get('/referrals', authMiddleware, affiliateController.getReferrals);

export default router;



