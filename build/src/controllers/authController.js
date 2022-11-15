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
exports.handleLogin = void 0;
const Users_1 = __importDefault(require("../model/Users"));
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const path = __importStar(require("path"));
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const errorHandlers_1 = require("../middleware/errorHandlers");
const logEvents_1 = require("../middleware/logEvents");
const handleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { email, hashedPassword } = req.body;
    if (!email || !hashedPassword)
        return res.status(400).json({ message: 'Username and password are required.' });
    const foundUser = yield Users_1.default.findOne({ email }).exec();
    if (!foundUser)
        return res.status(401).json({ message: `No user match given email: ${email}` });
    const match = yield bcrypt.compare(hashedPassword, foundUser.hashedPassword);
    if (match) {
        console.log(foundUser._id);
        const roles = Object.values(foundUser.roles);
        try {
            //creating Tokens
            const accessToken = jwt.sign({ _id: foundUser._id, roles: roles }, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.REFRESH_ACCESS_TOKEN_TIME, //change to 5 min (5m) in production
            });
            const refreshToken = jwt.sign({ _id: foundUser._id }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: process.env.REFRESH_REFRESH_TOKEN_TIME,
            });
            // save refreshToken = log in user
            yield foundUser.updateOne({ refreshToken: refreshToken });
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                maxAge: 24 * 50 * 60 * 1000,
            });
            // console.log(`$Status: 200\t User_Id: ${foundUser._id}\t Logged successfully\t token : ${accessToken}`);
            console.log(`$Status: 200\t User_Id: ${foundUser._id}\t Logged successfully`);
            (0, logEvents_1.logEvents)(`$Status: 200\t User_Id: ${foundUser._id}\t Logged successfully\t token : ${accessToken}`, 'reqLog.Log');
            res.status(200).json({
                message: 'Log in successfully',
                id: foundUser._id,
                userName: foundUser.firstName,
                roles: roles,
                accessToken: accessToken,
            });
        }
        catch (err) {
            (0, errorHandlers_1.apiErrorHandler)(req, res, err);
        }
    }
    else {
        res.status(406).json({ message: `Wrong password for: ${email}` });
    }
});
exports.handleLogin = handleLogin;
