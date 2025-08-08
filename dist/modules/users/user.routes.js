"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("./user.controller"));
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../utils/validation");
const auth_validation_1 = require("../auth/auth.validation");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authMiddleware, user_controller_1.default.getProfile);
router.put('/profile', auth_1.authMiddleware, (0, validation_1.validateRequest)(auth_validation_1.updateProfileSchema), user_controller_1.default.updateProfile);
router.post('/change-password', auth_1.authMiddleware, (0, validation_1.validateRequest)(auth_validation_1.changePasswordSchema), user_controller_1.default.changePassword);
router.get('/sessions', auth_1.authMiddleware, user_controller_1.default.getSessions);
router.delete('/sessions/:sessionId', auth_1.authMiddleware, user_controller_1.default.revokeSession);
router.post('/sessions/revoke-all', auth_1.authMiddleware, user_controller_1.default.revokeAllSessions);
router.delete('/delete-account', auth_1.authMiddleware, user_controller_1.default.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.routes.js.map