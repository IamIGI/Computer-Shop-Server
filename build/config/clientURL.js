"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.join(__dirname, '.env') });
const CLIENT_URL = process.env.DEPLOYMENT === 'dev' ? 'http://localhost:3000' : 'https://hotshoot.tk';
exports.default = CLIENT_URL;
