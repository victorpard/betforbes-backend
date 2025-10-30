import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import affiliateService from './affiliate.service';
import logger from '../../utils/logger';
import { getClientIP } from '../../utils/helpers';

class AffiliateController {
  /**
   * Criar perfil de afiliado
   */
  createAffiliate = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Código do afiliado é obrigatório',
        code: 'INVALID_CODE'
      });
    }

    const result = await affiliateService.createAffiliate(userId, code.trim());

    logger.info(`🎯 Afiliado criado: ${req.user?.email} - Código: ${code} - IP: ${getClientIP(req)}`);

    return res.status(201).json({
      success: true,
      message: 'Afiliado criado com sucesso',
      data: result
    });
  });

  /**
   * Obter link de referência do usuário
   */
  getReferralLink = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await affiliateService.getReferralLink(userId);

    logger.info(`🔗 Link de referência obtido: ${req.user?.email} - IP: ${getClientIP(req)}`);

    return res.json({
      success: true,
      message: 'Link de referência obtido com sucesso',
      data: result
    });
  });

  /**
   * Obter estatísticas de afiliados
   */
  getAffiliateStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    const stats = await affiliateService.getAffiliateStats(userId);

    logger.info(`📊 Estatísticas de afiliados obtidas: ${req.user?.email} - IP: ${getClientIP(req)}`);

    return res.json({
      success: true,
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  });

  /**
   * Listar usuários referenciados
   */
  getReferrals = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
        code: 'UNAUTHORIZED'
      });
    }

    const result = await affiliateService.getReferrals(userId, page, limit);

    logger.info(`👥 Lista de referrals obtida: ${req.user?.email} - Página ${page} - IP: ${getClientIP(req)}`);

    return res.json({
      success: true,
      message: 'Lista de referrals obtida com sucesso',
      data: result
    });
  });
}

export default new AffiliateController();
