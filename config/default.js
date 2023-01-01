"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
//remove ?
dotenv_1.default.config();
const accessToken = process.env.ACCESS_TOKEN_SECRET;
const config = {
    tokens: {
        accessToken,
    },
};
exports.default = config;
