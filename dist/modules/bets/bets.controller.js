"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = __importDefault(require("../../middlewares/authenticateToken"));
const bets_service_1 = __importDefault(require("./bets.service"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const router = (0, express_1.Router)();
router.get('/', authenticateToken_1.default, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma_1.default.order.findMany({ where: { userId } });
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { balance: true }
        });
        return res.json({
            success: true,
            data: {
                orders,
                balance: user?.balance ?? 0
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
router.post('/', authenticateToken_1.default, async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await bets_service_1.default.create({ userId, ...req.body });
        return res.json({ success: true, data: order });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});
router.post('/:id/close', authenticateToken_1.default, async (req, res) => {
    try {
        const userId = req.user.id;
        const updated = await bets_service_1.default.close(userId, req.params.id);
        return res.json({ success: true, data: updated });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=bets.controller.js.map