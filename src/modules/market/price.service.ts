import axios from 'axios';
import { logger } from '../../utils/logger';

const INFO_URL = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz/info';

interface SpotMeta {
  tokens: { name: string; index: number }[];
  universe: { name: string; index: number }[];
}

interface SpotStat {
  midPx: string;      // preço médio
  markPx: string;     // preço marcado
  prevDayPx: string;  // preço anterior
  dayNtlVlm: string;  // volume 24h
}

type InfoResponse = [SpotMeta, SpotStat[]];

// Cache simples para reduzir chamadas à API
let cachedAssets: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Lista os pares de spot suportados (ex: ["BTC/USDT","ETH/USDT",…])
 */
export async function listAssets(): Promise<string[]> {
  try {
    // Verificar cache
    const now = Date.now();
    if (cachedAssets && (now - cacheTimestamp) < CACHE_DURATION) {
      logger.info('Retornando assets do cache');
      return cachedAssets;
    }

    logger.info('Buscando assets da API Hyperliquid...');
    
    const resp = await axios.post<InfoResponse>(
      INFO_URL,
      { type: 'spotMeta' },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    // Validar estrutura da resposta
    if (!resp.data || !Array.isArray(resp.data) || resp.data.length < 1) {
      logger.error('Resposta da API Hyperliquid inválida:', resp.data);
      throw new Error('Resposta da API inválida');
    }

    const [meta] = resp.data;
    
    // Validar se meta.universe existe e é um array
    if (!meta || !meta.universe || !Array.isArray(meta.universe)) {
      logger.error('Estrutura meta.universe inválida:', meta);
      
      // Fallback com pares comuns
      const fallbackAssets = [
        'BTC/USDT', 'ETH/USDT', 'USDC/USDT', 'SOL/USDT', 
        'AVAX/USDT', 'MATIC/USDT', 'DOT/USDT', 'LINK/USDT'
      ];
      logger.warn('Usando fallback assets:', fallbackAssets);
      return fallbackAssets;
    }

    // Processar universe e filtrar pares válidos
    const assets = meta.universe
      .filter(u => u && u.name && typeof u.name === 'string')
      .map(u => u.name)
      .filter(name => name.includes('/'))
      .sort(); // Ordenar alfabeticamente

    logger.info(`Encontrados ${assets.length} assets:`, assets.slice(0, 10)); // Log primeiros 10

    // Atualizar cache
    cachedAssets = assets;
    cacheTimestamp = now;

    return assets;

  } catch (error: any) {
    logger.error('Erro ao buscar assets:', {
      message: error.message,
      url: INFO_URL,
      stack: error.stack
    });

    // Em caso de erro, retornar pares comuns como fallback
    const fallbackAssets = [
      'BTC/USDT', 'ETH/USDT', 'USDC/USDT', 'SOL/USDT', 
      'AVAX/USDT', 'MATIC/USDT', 'DOT/USDT', 'LINK/USDT'
    ];
    
    logger.warn('Retornando fallback assets devido ao erro');
    return fallbackAssets;
  }
}

/**
 * Busca o ticker via Info Endpoint
 * @param pair ex: "BTC/USDT"
 */
export async function fetchTicker(pair: string): Promise<{
  price: string;
  volume24h: string;
  change24h: string;
}> {
  try {
    logger.info(`Buscando ticker para par: ${pair}`);

    // Chama o endpoint completo spotMetaAndAssetCtxs
    const resp = await axios.post<InfoResponse>(
      INFO_URL,
      { type: 'spotMetaAndAssetCtxs' },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 segundos de timeout
      }
    );

    // Validar estrutura da resposta
    if (!resp.data || !Array.isArray(resp.data) || resp.data.length < 2) {
      logger.error('Resposta da API Hyperliquid inválida para ticker:', resp.data);
      throw new Error('Resposta da API inválida');
    }

    const [meta, stats] = resp.data;

    // Validar meta.universe
    if (!meta || !meta.universe || !Array.isArray(meta.universe)) {
      logger.error('Estrutura meta.universe inválida para ticker:', meta);
      const e = new Error('Dados de metadados inválidos da API');
      (e as any).status = 500;
      throw e;
    }

    // Validar stats
    if (!stats || !Array.isArray(stats)) {
      logger.error('Estrutura stats inválida:', stats);
      const e = new Error('Dados de estatísticas inválidos da API');
      (e as any).status = 500;
      throw e;
    }

    // Encontre a posição da universe que bate com o pair
    const uni = meta.universe.find(u => u && u.name === pair);
    if (!uni) {
      logger.warn(`Par não encontrado nos metadados: ${pair}`);
      logger.info('Pares disponíveis:', meta.universe.map(u => u?.name).filter(Boolean).slice(0, 20));
      
      const e = new Error(`Par não encontrado nos metadados: ${pair}`);
      (e as any).status = 404;
      throw e;
    }

    // Verificar se o índice é válido
    if (typeof uni.index !== 'number' || uni.index < 0 || uni.index >= stats.length) {
      logger.error(`Índice inválido para par ${pair}: ${uni.index}, stats.length: ${stats.length}`);
      const e = new Error(`Índice inválido para par: ${pair}`);
      (e as any).status = 500;
      throw e;
    }

    const stat = stats[uni.index];
    if (!stat) {
      logger.error(`Sem estatísticas para par ${pair} no índice ${uni.index}`);
      const e = new Error(`Sem estatísticas para par: ${pair}`);
      (e as any).status = 404;
      throw e;
    }

    // Validar dados das estatísticas
    if (!stat.midPx || !stat.dayNtlVlm || !stat.prevDayPx) {
      logger.error(`Dados incompletos para par ${pair}:`, stat);
      const e = new Error(`Dados incompletos para par: ${pair}`);
      (e as any).status = 500;
      throw e;
    }

    // Calcular mudança percentual com validação
    let change24h = '0.00';
    try {
      const currentPrice = parseFloat(stat.midPx);
      const prevPrice = parseFloat(stat.prevDayPx);
      
      if (prevPrice > 0) {
        change24h = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);
      }
    } catch (calcError) {
      logger.warn(`Erro ao calcular change24h para ${pair}:`, calcError);
    }

    const result = {
      price: stat.midPx,
      volume24h: stat.dayNtlVlm,
      change24h: change24h,
    };

    logger.info(`Ticker encontrado para ${pair}:`, result);
    return result;

  } catch (error: any) {
    logger.error(`Erro ao buscar ticker para ${pair}:`, {
      message: error.message,
      status: error.status,
      url: INFO_URL,
      stack: error.stack
    });

    // Re-throw com status preservado
    if (error.status) {
      throw error;
    }

    // Erro genérico
    const e = new Error(`Erro interno ao buscar ticker para ${pair}: ${error.message}`);
    (e as any).status = 500;
    throw e;
  }
}

