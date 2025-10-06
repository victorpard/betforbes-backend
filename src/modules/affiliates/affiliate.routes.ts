import { microcache } from '../../middlewares/microcache';
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
 *           description: Total de ganhos em reais (exemplo)
 *         referralLink:
 *           type: string
 *           description: Link único de referência do usuário
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
 *
 *     CreateAffiliateRequest:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           description: Código único do afiliado
 *           example: "AFFILIATE123"
 */

/**
 * @swagger
 * /api/affiliate/link:
 *   get:
 *     summary: Obter link único de referência do usuário autenticado
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
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralLink:
 *                       type: string
 *                       example: "https://www.betforbes.com/register?ref=ABC123"
 *                     referralCode:
 *                       type: string
 *                       example: "ABC123"
 */
router.get('/link', authMiddleware, affiliateController.getReferralLink);

/**
 * @swagger
 * /api/affiliate/me:
 *   get:
 *     summary: Alias para obter o link/código de referência do usuário autenticado
 *     tags: [Afiliados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de referência obtidos
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
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     referralLink:
 *                       type: string
 *                       example: "https://www.betforbes.com/register?ref=ABC123"
 *                     referralCode:
 *                       type: string
 *                       example: "ABC123"
 */
router.get('/me', authMiddleware, affiliateController.getReferralLink);

/**
 * @swagger
 * /api/affiliate/stats:
 *   get:
 *     summary: Obter estatísticas de afiliados do usuário autenticado
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
 *                   example: "OK"
 *                 data:
 *                   $ref: '#/components/schemas/AffiliateStats'
 */

   router.get('/stats', authMiddleware, microcache({ ttlMs: Number(process.env.AFFILIATE_STATS_MICROCACHE_MS ?? '3000'), key: (req) => {
     const uid = (req as any).user?.id ?? `anon:`;
     return `affiliate:stats:`;
   }}), affiliateController.getAffiliateStats);

/**
 * @swagger
 * /api/affiliate/referrals:
 *   get:
 *     summary: Listar usuários referenciados pelo usuário autenticado
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
 *                   example: "OK"
 *                 data:
 *                   type: object
 *                   properties:
 *                     referrals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReferralUser'
 *                     total:
 *                       type: number
 *                       example: 23
 *                     page:
 *                       type: number
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 3
 */
router.get('/referrals', authMiddleware, affiliateController.getReferrals);

// (Opcional) rota de criação estava comentada; mantenho como referência:
// router.post('/create', authMiddleware, affiliateController.createAffiliate);

export default router;
