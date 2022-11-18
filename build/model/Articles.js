"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
//Schema
const articleschema = new Schema({
    type: String,
    author: String,
    createdAt: String,
    updatedAt: String,
    prevImage: String,
    title: String,
    prevDescription: String,
});
const ArticleModel = mongoose_1.default.model('Articles', articleschema);
exports.default = ArticleModel;
