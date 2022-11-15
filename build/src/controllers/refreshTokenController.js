"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRefreshToken = void 0;
const Users_1 = __importDefault(require("../model/Users"));
const jwt = __importStar(require("jsonwebtoken"));
const path = __importStar(require("path"));
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const handleRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;
    const foundUser = yield Users_1.default.findOne({ refreshToken }).exec();
    if (!foundUser)
        return res.status(403).json({ message: 'given refreshToken does not match to any user refreshToken' });
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decodedToken) => {
        const user_id_db = JSON.stringify(foundUser._id).split('"')[1];
        if (err || user_id_db !== decodedToken._id)
            return res
                .status(403)
                .json(err ? { message: `JWT-error ${err}` } : { message: `JWT Verify: Users are not the same` });
        const id = user_id_db;
        const userName = foundUser.firstName;
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign({ _id: foundUser._id, roles: roles }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_ACCESS_TOKEN_TIME, //change to 5 min in production
        });
        res.json({ id, userName, roles, accessToken });
    });
});
exports.handleRefreshToken = handleRefreshToken;
