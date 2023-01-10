"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const recipientTemplateSchema = new Schema({
    name: String,
    street: String,
    zipCode: String,
    place: String,
    email: String,
    phone: String,
    comment: String,
});
const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    hashedPassword: String,
    Enlistments: {
        shopRules: Boolean,
        email: Boolean,
        sms: Boolean,
        phone: Boolean,
        adjustedOffers: Boolean,
    },
    refreshToken: String,
    roles: {
        User: {
            type: Number,
            default: 2001,
        },
        Editor: Number,
        Admin: Number,
    },
    userOrders: [Array],
    usedPromoCodes: [{ code: String, date: String }],
    userComments: Array,
    commentedProducts: Array,
    recipientTemplates: [
        {
            name: String,
            street: String,
            zipCode: String,
            place: String,
            email: String,
            phone: String,
        },
    ],
    notifications: {
        newComment: {
            showNotification: Boolean,
            allowNotification: Boolean,
            productIds: [String],
        },
    },
});
const UserModel = mongoose_1.default.model('users', userSchema);
exports.default = UserModel;
