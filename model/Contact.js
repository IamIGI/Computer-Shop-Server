"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const contactSchema = new Schema({
    name: String,
    email: String,
    date: String,
    message: String,
    category: Number,
    image: {
        added: Boolean,
        images: [
            {
                type: String,
            },
        ],
    },
});
exports.default = mongoose_1.default.model('contacts', contactSchema);
