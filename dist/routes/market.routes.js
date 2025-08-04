"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const price_service_1 = require("../modules/market/price.service");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
/**
 * GET /api/markets
 * Lista todos os pares de mercado disponíveis
 */
router.get('/', async (req, res) => {
    const startTime = Date.now();
    try {
        logger_1.logger.info('Requisição para listar assets', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const assets = await (0, price_service_1.listAssets)();
        const duration = Date.now() - startTime;
        logger_1.logger.info(`Assets listados com sucesso em ${duration}ms`, {
            count: assets.length,
            duration
        });
        return res.json({
            success: true,
            data: assets,
            count: assets.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        const duration = Date.now() - startTime;
        logger_1.logger.error('Erro ao listar assets', {
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
router.get('/:pair', async (req, res) => {
    const startTime = Date.now();
    const rawPair = req.params.pair;
    try {
        if (!rawPair) {
            logger_1.logger.warn('Requisição sem par especificado', { ip: req.ip });
            return res.status(400).json({
                success: false,
                message: 'Par inválido ou não especificado',
                timestamp: new Date().toISOString()
            });
        }
        // Decodificar URL (ex: BTC%2FUSDT -> BTC/USDT)
        const pair = decodeURIComponent(rawPair);
        logger_1.logger.info(`Requisição para ticker do par: ${pair}`, {
            rawPair,
            decodedPair: pair,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const ticker = await (0, price_service_1.fetchTicker)(pair);
        const duration = Date.now() - startTime;
        logger_1.logger.info(`Ticker obtido com sucesso para ${pair} em ${duration}ms`, {
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
    }
    catch (err) {
        const duration = Date.now() - startTime;
        const pair = rawPair ? decodeURIComponent(rawPair) : 'unknown';
        logger_1.logger.error(`Erro ao buscar ticker para ${pair}`, {
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
router.get('/health', async (_req, res) => {
    try {
        // Teste rápido da API
        const assets = await (0, price_service_1.listAssets)();
        return res.json({
            success: true,
            status: 'healthy',
            assetsCount: assets.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        logger_1.logger.error('Health check falhou para API de mercados', {
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
exports.default = router;
