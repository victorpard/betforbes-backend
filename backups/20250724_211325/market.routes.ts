import { Router, Request, Response } from 'express';
import { listAssets, fetchTicker } from '../modules/market/price.service';

const router = Router();

/**
 * GET /api/markets
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assets = await listAssets();
    return res.json(assets);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/markets/:pair
 * Ex: /api/markets/BTC/USDT
 */
router.get('/:pair', async (req: Request, res: Response) => {
  const rawPair = req.params.pair;
  if (!rawPair) {
    return res
      .status(400)
      .json({ success: false, message: 'Par inválido' });
  }
  const pair = rawPair; // ex: "BTC/USDT"

  try {
    const ticker = await fetchTicker(pair);
    return res.json(ticker);
  } catch (err: any) {
    // Se nosso service lançou e.status=404
    if (err.status === 404) {
      return res
        .status(404)
        .json({ success: false, message: err.message });
    }
    return res
      .status(500)
      .json({ success: false, message: err.message });
  }
});

export default router;
