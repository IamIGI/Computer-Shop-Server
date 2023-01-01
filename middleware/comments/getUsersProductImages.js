"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getUsersProductImages = (productId) => {
    let urlArray = [];
    let fileName = []; // there was change from string to array ' = '' -> = []'
    let imagePath = '';
    const targetPath = path_1.default.join(__dirname, `../../files/comments/${productId}/`);
    if (!fs_1.default.existsSync(targetPath))
        return urlArray;
    const dirInProduct = fs_1.default.readdirSync(targetPath);
    for (let i = 0; i < dirInProduct.length; i++) {
        fileName = fs_1.default.readdirSync(`${targetPath}/${dirInProduct[i]}`);
        imagePath = `comments/${productId}/${dirInProduct[i]}/${fileName[0]}`;
        urlArray.push(imagePath);
    }
    return urlArray;
};
exports.default = getUsersProductImages;
