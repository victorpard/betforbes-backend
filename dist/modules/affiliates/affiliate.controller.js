"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../middlewares/errorHandler");
const affiliate_service_1 = __importDefault(require("./affiliate.service"));
class AffiliateController {
    getReferralLink = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const result = await affiliate_service_1.default.getReferralLink(userId);
        return res.json({
            success: true,
            message: 'Link de referência obtido com sucesso',
            data: result,
        });
    });
    getAffiliateStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const stats = await affiliate_service_1.default.getAffiliateStats(userId);
        return res.json({
            success: true,
            message: 'Estatísticas de afiliados obtidas com sucesso',
            data: stats,
        });
    });
    getReferrals = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const { referrals, total } = await affiliate_service_1.default.getReferrals(userId, page, limit);
        return res.json({
            success: true,
            message: 'Referrals listados com sucesso',
            data: { referrals, total, page },
        });
    });
}
exports.default = new AffiliateController();
//# sourceMappingURL=affiliate.controller.js.map