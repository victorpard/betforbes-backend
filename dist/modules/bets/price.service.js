"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
exports.default = {
    async fetchCurrentPrice(asset) {
        const resp = await axios_1.default.get(`${process.env.PRICE_FEED_URL}/price?symbol=${asset}`);
        return parseFloat(resp.data.price);
    }
};
//# sourceMappingURL=price.service.js.map