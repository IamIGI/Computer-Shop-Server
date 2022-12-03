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
const path_1 = __importDefault(require("path"));
require('dotenv').config({ path: path_1.default.join(__dirname, '..', '.emv') });
const handleLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.status(401).json({ message: 'JWT cookies does not exists' });
    const refreshToken = cookies.jwt;
    const foundUser = yield Users_1.default.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            maxAge: 24 * 50 * 60 * 1000,
        });
        return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
    }
    //Delete refresh Token in db
    yield foundUser.updateOne({ refreshToken: '' });
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 24 * 50 * 60 * 1000,
    });
    return res.status(200).json({ message: 'Erased JWT cookie nad user refreshToken propriety', user: 'logout' });
});
exports.default = { handleLogout };
