"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const promoCodesSchema = new Schema({
    general: [String],
    category: {
        delivery: [String],
        products: {
            dell: [String],
            msi: [String],
            hp: [String],
            asus: [String],
            apple: [String],
            microsoft: [String],
            general: [String],
        },
    },
    allCodes: [String],
});
const PromoCodesModel = mongoose_1.default.model('promocodes', promoCodesSchema);
exports.default = PromoCodesModel;
