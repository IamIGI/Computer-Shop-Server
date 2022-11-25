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
const errorHandlers_1 = require("../middleware/errorHandlers");
const bcrypt_1 = __importDefault(require("bcrypt"));
const logEvents_1 = require("../middleware/logEvents");
const user_services_1 = __importDefault(require("../services/user.services"));
const getUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.originalUrl);
    const { userId } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });
    console.log(`User: ${userId} data send`);
    return res.status(200).json(user);
});
const updateAccountData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { _id, fieldName, password } = req.body;
    let { edited } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    const match = yield bcrypt_1.default.compare(password, user.hashedPassword);
    if (!match)
        return res.status(406).json({ message: `Wrong password for user: ${_id}` });
    try {
        if (fieldName === 'hashedPassword')
            edited = yield bcrypt_1.default.hash(edited, 10);
        yield Users_1.default.updateOne({ _id }, { [`${fieldName}`]: edited });
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account field updated: ${fieldName}`, `reqLog.Log`);
        res.status(202).json({ success: ` UserID: ${_id}. Account field updated: ${fieldName}` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const updateEnlistments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    console.log(req.body);
    const { _id, email, sms, phone, adjustedOffers } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    try {
        yield user_services_1.default.updateEnlistments(_id, email, sms, phone, adjustedOffers);
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account enlistments updated.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${_id}.  Account enlistments updated.` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const addRecipientTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { userId, recipientTemplate: { name, street, zipCode, place, email, phone }, } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });
    if (!(yield user_services_1.default.allowRecipientTemplate(userId)))
        return res.status(400).json({ message: `UserID: ${userId}. User can have max 4 templates` });
    try {
        yield user_services_1.default.updateRecipientDetailsTemplates(userId, name, street, zipCode, place, email, phone);
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${userId}.\t Added new recipient template.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${userId}.  Added new recipient template.` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getRecipientTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.originalUrl);
    const { userId } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });
    console.log(`User: ${userId} data send`);
    return res.status(200).json(user.recipientTemplates);
});
const editRecipientTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { userId, recipientId, recipientTemplate: { name, street, zipCode, place, email, phone }, } = req.body;
    const user = yield Users_1.default.findOne({ _id: userId }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${userId}. Given user does not exists in db` });
    try {
        yield user_services_1.default.replaceRecipientDetailsTemplate(userId, recipientId, name, street, zipCode, place, email, phone);
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${userId}.\t Successfully edited recipient template.`, `reqLog.Log`);
        res.status(202).json({ success: `UserID: ${userId}.  Successfully edited recipient template.` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { _id, password } = req.body;
    const user = yield Users_1.default.findOne({ _id }).exec();
    if (!user)
        return res.status(204).json({ message: `UserID: ${_id}. Given user does not exists in db` });
    const match = yield bcrypt_1.default.compare(password, user.hashedPassword);
    if (!match)
        return res.status(406).json({ message: `Wrong password for user: ${_id}` });
    try {
        yield user.deleteOne({ _id });
        (0, logEvents_1.logEvents)(`Status: 202\t UserID: ${_id}.\t Account was deleted.`, `reqLog.Log`);
        res.status(202).json({ message: `UserID: ${_id}. Account was successfully deleted` });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.default = {
    getUserData,
    updateAccountData,
    updateEnlistments,
    deleteUser,
    addRecipientTemplate,
    getRecipientTemplate,
    editRecipientTemplate,
};
