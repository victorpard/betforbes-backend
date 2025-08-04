"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth")); // ajustado para apontar para o arquivo de router
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
// outras rotas que vierem depois, ex:
// router.use('/users', userRoutes);
exports.default = router;
