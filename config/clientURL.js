"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.join(__dirname, '.env') });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const CLIENT_URL = app.get('env') === 'development' ? 'http://localhost:3000' : 'https://hotshoot.tk';
exports.default = CLIENT_URL;
