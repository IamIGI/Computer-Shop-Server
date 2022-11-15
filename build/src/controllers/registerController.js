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
exports.handleNewUser = void 0;
const Users_1 = __importDefault(require("../model/Users"));
const ForbiddenWords_1 = __importDefault(require("../model/ForbiddenWords"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const bcrypt = __importStar(require("bcrypt"));
const logEvents_1 = require("../middleware/logEvents");
const handleNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { firstName, lastName, email, hashedPassword, shopRules, emailEnlistments, smsEnlistments, phoneEnlistments, adjustedOffersEnlistments, } = req.body;
    if (!firstName || !hashedPassword || !email)
        return res.status(400).json({ message: 'Username, password, email are required.' });
    const duplicateEmail = yield Users_1.default.findOne({ email }).exec();
    if (duplicateEmail) {
        console.log('Email already in use');
        return res.sendStatus(409);
    }
    const forbiddenWords = (yield ForbiddenWords_1.default.find({}).exec())[0].forbiddenWords;
    for (let i = 0; i < forbiddenWords.length; i++) {
        if (firstName.toLowerCase().includes(forbiddenWords[i])) {
            return res.sendStatus(418); // Given name contains vulgar and offensive content
        }
    }
    try {
        const hashedPwd = yield bcrypt.hash(hashedPassword, 10);
        const result = yield Users_1.default.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            hashedPassword: hashedPwd,
            Enlistments: {
                shopRules: shopRules,
                email: emailEnlistments,
                sms: smsEnlistments,
                phone: phoneEnlistments,
                adjustedOffers: adjustedOffersEnlistments,
            },
            roles: { User: 2001 },
            refreshToken: '',
            userOrders: [],
        });
        console.log(`Status: 201 success: New user ${result._id} created!`);
        (0, logEvents_1.logEvents)(`Status: 201\t User_Id: ${result._id}\t New user created! \t`, 'reqLog.Log');
        res.status(201).json({ success: `New user ${result._id} created!` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.handleNewUser = handleNewUser;
