"use strict";
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
const Users_1 = __importDefault(require("../model/Users"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.join(__dirname, '..', '.env') });
const handleRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;
    const foundUser = yield Users_1.default.findOne({ refreshToken }).exec();
    if (!foundUser)
        return res.status(403).json({ message: 'given refreshToken does not match to any user refreshToken' });
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decodedToken) => {
        const user_id_db = JSON.stringify(foundUser._id).split('"')[1];
        if (err || user_id_db !== decodedToken._id)
            return res
                .status(403)
                .json(err ? { message: `JWT-error ${err}` } : { message: `JWT Verify: Users are not the same` });
        const id = user_id_db;
        const userName = foundUser.firstName;
        const roles = Object.values(foundUser.roles);
        const accessToken = jsonwebtoken_1.default.sign({ _id: foundUser._id, roles: roles }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_ACCESS_TOKEN_TIME, //change to 5 min in production
        });
        const email = foundUser.email;
        res.json({ id, userName, roles, accessToken, email });
    });
});
exports.default = { handleRefreshToken };
