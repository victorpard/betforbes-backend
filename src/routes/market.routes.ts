import { Router, Request, Response } from 'express';
import { listAssets, fetchTicker } from '../modules/market/price.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/markets
 * Lista todos os pares de mercado disponíveis
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    logger.info('Requisição para listar assets', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const assets = await listAssets();
    
    const duration = Date.now() - startTime;
    logger.info(`Assets listados com sucesso em ${duration}ms`, {
      count: assets.length,
      duration
    });

    return res.json({
      success: true,
      data: assets,
      count: assets.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error('Erro ao listar assets', {
      error: err.message,
      stack: err.stack,
      duration,
      ip: req.ip
    });

    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/markets/:pair
 * Busca informações de um par específico
 * Ex: /api/markets/BTC%2FUSDT (BTC/USDT URL encoded)
 */
router.get('/:pair', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const rawPair = req.params.pair;
  
  try {
    if (!rawPair) {
      logger.warn('Requisição sem par especificado', { ip: req.ip });
      return res.status(400).json({ 
        success: false, 
        message: 'Par inválido ou não especificado',
        timestamp: new Date().toISOString()
      });
    }

    // Decodificar URL (ex: BTC%2FUSDT -> BTC/USDT)
    const pair = decodeURIComponent(rawPair);
    
    logger.info(`Requisição para ticker do par: ${pair}`, {
      rawPair,
      decodedPair: pair,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const ticker = await fetchTicker(pair);
    
    const duration = Date.now() - startTime;
    logger.info(`Ticker obtido com sucesso para ${pair} em ${duration}ms`, {
      pair,
      duration,
      price: ticker.price
    });

    return res.json({
      success: true,
      data: {
        pair,
        ...ticker
      },
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    const pair = rawPair ? decodeURIComponent(rawPair) : 'unknown';
    
    logger.error(`Erro ao buscar ticker para ${pair}`, {
      pair,
      rawPair,
      error: err.message,
      status: err.status,
      duration,
      ip: req.ip
    });

    // Se nosso service lançou erro com status específico
    if (err.status === 404) {
      return res.status(404).json({ 
        success: false, 
        message: err.message,
        pair,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: err.message || 'Erro interno do servidor',
      pair,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/markets/health
 * Endpoint de health check específico para a API de mercados
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Teste rápido da API
    const assets = await listAssets();
    
    return res.json({
      success: true,
      status: 'healthy',
      assetsCount: assets.length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    logger.error('Health check falhou para API de mercados', {
      error: err.message
    });

    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

