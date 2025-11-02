import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import affiliateService from './affiliate.service';

class AffiliateController {
  /** Obter link de referência */
  getReferralLink = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await affiliateService.getReferralLink(userId);
    return res.json({
      success: true,
      message: 'Link de referência obtido com sucesso',
      data: result,
    });
  });

  /** Obter estatísticas de afiliados */
  getAffiliateStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const stats = await affiliateService.getAffiliateStats(userId);
    return res.json({
      success: true,
      message: 'Estatísticas de afiliados obtidas com sucesso',
      data: stats,
    });
  });

  /** Listar usuários referenciados */
  getReferrals = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const { referrals, total } = await affiliateService.getReferrals(
      userId,
      page,
      limit
    );
    return res.json({
      success: true,
      message: 'Referrals listados com sucesso',
      data: { referrals, total, page },
    });
  });
}

export default new AffiliateController();
