"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("./auth.controller"));
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../utils/validation");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validateRequest)(auth_validation_1.registerSchema), auth_controller_1.default.register);
router.post('/login', (0, validation_1.validateRequest)(auth_validation_1.loginSchema), auth_controller_1.default.login);
router.get('/verify-email', auth_controller_1.default.verifyEmail);
router.post('/resend-verification', (0, validation_1.validateRequest)(auth_validation_1.resendVerificationSchema), auth_controller_1.default.resendVerification);
router.post('/forgot-password', (0, validation_1.validateRequest)(auth_validation_1.forgotPasswordSchema), auth_controller_1.default.forgotPassword);
router.post('/reset-password', (0, validation_1.validateRequest)(auth_validation_1.resetPasswordSchema), auth_controller_1.default.resetPassword);
router.post('/refresh', auth_controller_1.default.refreshToken);
router.post('/logout', auth_1.authMiddleware, auth_controller_1.default.logout);
router.get('/profile', auth_1.authMiddleware, auth_controller_1.default.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map