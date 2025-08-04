"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const affiliate_controller_1 = __importDefault(require("./affiliate.controller"));
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/link', auth_1.authMiddleware, affiliate_controller_1.default.getReferralLink);
router.get('/stats', auth_1.authMiddleware, affiliate_controller_1.default.getAffiliateStats);
router.get('/referrals', auth_1.authMiddleware, affiliate_controller_1.default.getReferrals);
exports.default = router;
//# sourceMappingURL=affiliate.routes.js.map