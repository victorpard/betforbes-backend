"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const bets_service_1 = __importDefault(require("./bets.service"));
const router = (0, express_1.Router)();
router.post('/', authenticateToken_1.default, async (req, res) => {
    try {
        const { asset, type, amount, leverage, direction } = req.body;
        const entryPrice = await bets_service_1.default.fetchCurrentPrice(asset);
        const order = await prisma_1.default.order.create({
            data: {
                userId: req.user.id,
                asset,
                type,
                amount,
                leverage,
                direction,
                entryPrice,
                status: 'OPEN',
            },
        });
        return res.json({ success: true, data: order });
    }
    catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});
router.get('/', authenticateToken_1.default, async (req, res) => {
    try {
        const orders = await prisma_1.default.order.findMany({ where: { userId: req.user.id } });
        return res.json({ success: true, data: orders });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=bets.routes.js.map