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
exports.deleteUser = exports.updateEnlistments = exports.updateAccountData = exports.getUserData = void 0;
const Users_1 = __importDefault(require("../model/Users"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const bcrypt = __importStar(require("bcrypt"));
const logEvents_1 = require("../middleware/logEvents");
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.originalUrl);
    const { userId } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });
    console.log(`User: ${userId} data send`);
    return res.status(200).json(user);
});
exports.getUserData = getUserData;
const updateAccountData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { _id, fieldName, password } = req.body;
    let { edited } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    const match = yield bcrypt.compare(password, user.hashedPassword);
    if (!match)
        return res.status(406).json({ message: `Wrong password for user: ${_id}` });
    try {
        if (fieldName === 'hashedPassword')
            edited = yield bcrypt.hash(edited, 10);
        result = yield Users_1.default.updateOne({ _id }, { [`${fieldName}`]: edited });
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account field updated: ${fieldName}`, `reqLog.Log`);
        res.status(202).json({ success: ` UserID: ${_id}. Account field updated: ${fieldName}` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.updateAccountData = updateAccountData;
const updateEnlistments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    console.log(req.body);
    const { _id, email, sms, phone, adjustedOffers } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    try {
        result = yield Users_1.default.updateOne({ _id }, {
            // email: podsiadlo@gmail.com
            Enlistments: {
                shopRules: true,
                email,
                sms,
                phone,
                adjustedOffers,
            },
        });
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account enlistments updated.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${_id}.  Account enlistments updated.` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.updateEnlistments = updateEnlistments;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    let { _id, password } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    const match = yield bcrypt.compare(password, user.hashedPassword);
    if (!match)
        return res.status(406).json({ message: `Wrong password for user: ${_id}` });
    try {
        console.log('deleting user.');
        result = yield user.deleteOne({ _id });
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account was deleted.`, `reqLog.Log`);
        res.status(202).json({ message: `UserID: ${_id}. Account was successfully deleted` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.deleteUser = deleteUser;
