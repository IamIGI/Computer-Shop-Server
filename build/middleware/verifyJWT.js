"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
require('dotenv').config(path_1.default.join(__dirname, '..', '.env'));
const verifyJWT = (req, res, next) => {
    console.log(req.originalUrl);
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log(`Token: ${authHeader}`);
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')))
        return res.status(401).json({ message: 'missing authorization token' });
    const token = authHeader.split(' ')[1];
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if (err)
            return res.status(403).json({ message: 'Invalid token (forbidden)', error: `${err}` });
        console.log('Token validated correctly ');
        req.user = decodedToken.email;
        req.roles = decodedToken.roles;
        next();
    });
};
exports.default = verifyJWT;
