"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const price_service_1 = require("../modules/market/price.service");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    const startTime = Date.now();
    try {
        logger_1.default.info('Requisição para listar assets', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const assets = await (0, price_service_1.listAssets)();
        const duration = Date.now() - startTime;
        logger_1.default.info(`Assets listados com sucesso em ${duration}ms`, {
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
        logger_1.default.error('Erro ao listar assets', {
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
router.get('/:pair', async (req, res) => {
    const startTime = Date.now();
    const rawPair = req.params.pair;
    try {
        if (!rawPair) {
            logger_1.default.warn('Requisição sem par especificado', { ip: req.ip });
            return res.status(400).json({
                success: false,
                message: 'Par inválido ou não especificado',
                timestamp: new Date().toISOString()
            });
        }
        const pair = decodeURIComponent(rawPair);
        logger_1.default.info(`Requisição para ticker do par: ${pair}`, {
            rawPair,
            decodedPair: pair,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        const ticker = await (0, price_service_1.fetchTicker)(pair);
        const duration = Date.now() - startTime;
        logger_1.default.info(`Ticker obtido com sucesso para ${pair} em ${duration}ms`, {
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
        logger_1.default.error(`Erro ao buscar ticker para ${pair}`, {
            pair,
            rawPair,
            error: err.message,
            status: err.status,
            duration,
            ip: req.ip
        });
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
router.get('/health', async (_req, res) => {
    try {
        const assets = await (0, price_service_1.listAssets)();
        return res.json({
            success: true,
            status: 'healthy',
            assetsCount: assets.length,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        logger_1.default.error('Health check falhou para API de mercados', {
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
//# sourceMappingURL=market.routes.js.map