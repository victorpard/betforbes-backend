"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../middlewares/errorHandler");
const affiliate_service_1 = __importDefault(require("./affiliate.service"));
const logger_1 = require("../../utils/logger");
const helpers_1 = require("../../utils/helpers");
class AffiliateController {
    constructor() {
        /**
         * Obter link de referência do usuário
         */
        this.getReferralLink = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                    code: 'UNAUTHORIZED'
                });
            }
            const result = await affiliate_service_1.default.getReferralLink(userId);
            logger_1.logger.info(`🔗 Link de referência obtido: ${req.user?.email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
            return res.json({
                success: true,
                message: 'Link de referência obtido com sucesso',
                data: result
            });
        });
        /**
         * Obter estatísticas de afiliados
         */
        this.getAffiliateStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                    code: 'UNAUTHORIZED'
                });
            }
            const stats = await affiliate_service_1.default.getAffiliateStats(userId);
            logger_1.logger.info(`📊 Estatísticas de afiliados obtidas: ${req.user?.email} - IP: ${(0, helpers_1.getClientIP)(req)}`);
            return res.json({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: stats
            });
        });
        /**
         * Listar usuários referenciados
         */
        this.getReferrals = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado',
                    code: 'UNAUTHORIZED'
                });
            }
            const result = await affiliate_service_1.default.getReferrals(userId, page, limit);
            logger_1.logger.info(`👥 Lista de referrals obtida: ${req.user?.email} - Página ${page} - IP: ${(0, helpers_1.getClientIP)(req)}`);
            return res.json({
                success: true,
                message: 'Lista de referrals obtida com sucesso',
                data: result
            });
        });
    }
}
exports.default = new AffiliateController();
