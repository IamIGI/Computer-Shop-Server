"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const commentSchema = new Schema({
    productId: String,
    comments: [
        {
            userId: String,
            userName: String,
            date: String,
            confirmed: Boolean,
            likes: {
                up: {
                    type: Number,
                    default: 0,
                },
                down: {
                    type: Number,
                    default: 0,
                },
            },
            content: {
                rating: Number,
                description: String,
            },
            image: {
                added: Boolean,
                images: [
                    {
                        type: String,
                    },
                ],
            },
            usersWhoLiked: [{ userId: String, likeUp: Boolean }],
        },
    ],
});
const CommentModel = mongoose_1.default.model('comments', commentSchema);
exports.default = CommentModel;
