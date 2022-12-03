"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const hotShootSchema = new Schema({
    promotion: { productData: Object, discount: Number, date: String, isMorning: Boolean },
    queue: [{ productId: String, discount: Number }],
    blocked: [{ productId: String, date: String }],
});
const HotShootModel = mongoose_1.default.model('hotshoots', hotShootSchema);
exports.default = HotShootModel;
