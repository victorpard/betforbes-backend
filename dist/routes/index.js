"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const affiliate_routes_1 = __importDefault(require("../modules/affiliates/affiliate.routes"));
const auth_1 = require("../middlewares/auth");
const express_1 = require("express");
const auth_2 = __importDefault(require("./auth"));
const market_routes_1 = __importDefault(require("./market.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_2.default);
router.use('/affiliate', auth_1.authenticateToken, affiliate_routes_1.default);
router.use('/market', market_routes_1.default);
router.use('/affiliate', affiliate_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map