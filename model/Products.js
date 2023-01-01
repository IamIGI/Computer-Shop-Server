"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const productschema = new Schema({
    special_offer: {
        mode: Boolean,
        price: Number,
    },
});
const ProductModel = mongoose_1.default.model('Products', productschema);
exports.default = ProductModel;
