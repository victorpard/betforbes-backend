"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAssets = listAssets;
exports.fetchTicker = fetchTicker;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../../utils/logger");
const INFO_URL = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz/info';
// Cache simples para reduzir chamadas à API
let cachedAssets = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
/**
 * Lista os pares de spot suportados (ex: ["BTC/USDT","ETH/USDT",…])
 */
async function listAssets() {
    try {
        // Verificar cache
        const now = Date.now();
        if (cachedAssets && (now - cacheTimestamp) < CACHE_DURATION) {
            logger_1.logger.info('Retornando assets do cache');
            return cachedAssets;
        }
        logger_1.logger.info('Buscando assets da API Hyperliquid...');
        const resp = await axios_1.default.post(INFO_URL, { type: 'spotMeta' }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // 10 segundos de timeout
        });
        // Validar estrutura da resposta
        if (!resp.data || !Array.isArray(resp.data) || resp.data.length < 1) {
            logger_1.logger.error('Resposta da API Hyperliquid inválida:', resp.data);
            throw new Error('Resposta da API inválida');
        }
        const [meta] = resp.data;
        // Validar se meta.universe existe e é um array
        if (!meta || !meta.universe || !Array.isArray(meta.universe)) {
            logger_1.logger.error('Estrutura meta.universe inválida:', meta);
            // Fallback com pares comuns
            const fallbackAssets = [
                'BTC/USDT', 'ETH/USDT', 'USDC/USDT', 'SOL/USDT',
                'AVAX/USDT', 'MATIC/USDT', 'DOT/USDT', 'LINK/USDT'
            ];
            logger_1.logger.warn('Usando fallback assets:', fallbackAssets);
            return fallbackAssets;
        }
        // Processar universe e filtrar pares válidos
        const assets = meta.universe
            .filter(u => u && u.name && typeof u.name === 'string')
            .map(u => u.name)
            .filter(name => name.includes('/'))
            .sort(); // Ordenar alfabeticamente
        logger_1.logger.info(`Encontrados ${assets.length} assets:`, assets.slice(0, 10)); // Log primeiros 10
        // Atualizar cache
        cachedAssets = assets;
        cacheTimestamp = now;
        return assets;
    }
    catch (error) {
        logger_1.logger.error('Erro ao buscar assets:', {
            message: error.message,
            url: INFO_URL,
            stack: error.stack
        });
        // Em caso de erro, retornar pares comuns como fallback
        const fallbackAssets = [
            'BTC/USDT', 'ETH/USDT', 'USDC/USDT', 'SOL/USDT',
            'AVAX/USDT', 'MATIC/USDT', 'DOT/USDT', 'LINK/USDT'
        ];
        logger_1.logger.warn('Retornando fallback assets devido ao erro');
        return fallbackAssets;
    }
}
/**
 * Busca o ticker via Info Endpoint
 * @param pair ex: "BTC/USDT"
 */
async function fetchTicker(pair) {
    try {
        logger_1.logger.info(`Buscando ticker para par: ${pair}`);
        // Chama o endpoint completo spotMetaAndAssetCtxs
        const resp = await axios_1.default.post(INFO_URL, { type: 'spotMetaAndAssetCtxs' }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000 // 10 segundos de timeout
        });
        // Validar estrutura da resposta
        if (!resp.data || !Array.isArray(resp.data) || resp.data.length < 2) {
            logger_1.logger.error('Resposta da API Hyperliquid inválida para ticker:', resp.data);
            throw new Error('Resposta da API inválida');
        }
        const [meta, stats] = resp.data;
        // Validar meta.universe
        if (!meta || !meta.universe || !Array.isArray(meta.universe)) {
            logger_1.logger.error('Estrutura meta.universe inválida para ticker:', meta);
            const e = new Error('Dados de metadados inválidos da API');
            e.status = 500;
            throw e;
        }
        // Validar stats
        if (!stats || !Array.isArray(stats)) {
            logger_1.logger.error('Estrutura stats inválida:', stats);
            const e = new Error('Dados de estatísticas inválidos da API');
            e.status = 500;
            throw e;
        }
        // Encontre a posição da universe que bate com o pair
        const uni = meta.universe.find(u => u && u.name === pair);
        if (!uni) {
            logger_1.logger.warn(`Par não encontrado nos metadados: ${pair}`);
            logger_1.logger.info('Pares disponíveis:', meta.universe.map(u => u?.name).filter(Boolean).slice(0, 20));
            const e = new Error(`Par não encontrado nos metadados: ${pair}`);
            e.status = 404;
            throw e;
        }
        // Verificar se o índice é válido
        if (typeof uni.index !== 'number' || uni.index < 0 || uni.index >= stats.length) {
            logger_1.logger.error(`Índice inválido para par ${pair}: ${uni.index}, stats.length: ${stats.length}`);
            const e = new Error(`Índice inválido para par: ${pair}`);
            e.status = 500;
            throw e;
        }
        const stat = stats[uni.index];
        if (!stat) {
            logger_1.logger.error(`Sem estatísticas para par ${pair} no índice ${uni.index}`);
            const e = new Error(`Sem estatísticas para par: ${pair}`);
            e.status = 404;
            throw e;
        }
        // Validar dados das estatísticas
        if (!stat.midPx || !stat.dayNtlVlm || !stat.prevDayPx) {
            logger_1.logger.error(`Dados incompletos para par ${pair}:`, stat);
            const e = new Error(`Dados incompletos para par: ${pair}`);
            e.status = 500;
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
        }
        catch (calcError) {
            logger_1.logger.warn(`Erro ao calcular change24h para ${pair}:`, calcError);
        }
        const result = {
            price: stat.midPx,
            volume24h: stat.dayNtlVlm,
            change24h: change24h,
        };
        logger_1.logger.info(`Ticker encontrado para ${pair}:`, result);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Erro ao buscar ticker para ${pair}:`, {
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
        e.status = 500;
        throw e;
    }
}
