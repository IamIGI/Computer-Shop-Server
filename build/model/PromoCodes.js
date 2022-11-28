"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const promoCodesSchema = new Schema({
    category: String,
    product: String,
    code: String,
    createdAt: String,
    expiredIn: String,
});
const PromoCodesModel = mongoose_1.default.model('promocodes', promoCodesSchema);
exports.default = PromoCodesModel;
