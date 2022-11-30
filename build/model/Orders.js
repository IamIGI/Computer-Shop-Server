"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const orderSchema = new Schema({
    status: Number,
    products: [
        {
            name: String,
            prevImg: String,
            price: Number,
            priceBeforeDiscount: Number,
            isDiscount: Boolean,
            code: Number,
            quantity: Number,
        },
    ],
    transactionInfo: {
        date: String,
        deliveryMethod: String,
        paymentMethod: String,
        price: Number,
        recipientDetails: {
            name: String,
            street: String,
            zipCode: String,
            place: String,
            email: String,
            phone: Number,
            comment: String,
        },
    },
    usedPromoCode: String,
});
const OrderModel = mongoose_1.default.model('Orders', orderSchema);
exports.default = OrderModel;
