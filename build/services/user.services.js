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
function allowRecipientTemplate(userId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Users_1.default.findOne({ _id: userId }).exec();
        if (user.recipientTemplates !== undefined && ((_a = user.recipientTemplates) === null || _a === void 0 ? void 0 : _a.length) > 3) {
            return false;
        }
        return true;
    });
}
function updateRecipientDetailsTemplates(userId, name, street, zipCode, place, email, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Users_1.default.updateOne({ _id: userId }, {
                $push: {
                    recipientTemplates: {
                        name,
                        street,
                        zipCode,
                        place,
                        email,
                        phone,
                    },
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function replaceRecipientDetailsTemplate(userId, recipientId, name, street, zipCode, place, email, phone) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Users_1.default.updateOne({ _id: userId }, {
                $set: {
                    'recipientTemplates.$[recipientTemplate].name': name,
                    'recipientTemplates.$[recipientTemplate].street': street,
                    'recipientTemplates.$[recipientTemplate].zipCode': zipCode,
                    'recipientTemplates.$[recipientTemplate].place': place,
                    'recipientTemplates.$[recipientTemplate].email': email,
                    'recipientTemplates.$[recipientTemplate].phone': phone,
                },
            }, {
                arrayFilters: [
                    {
                        'recipientTemplate._id': recipientId,
                    },
                ],
            });
        }
        catch (err) {
            throw err;
        }
    });
}
function updateEnlistments(userId, email, sms, phone, adjustedOffers) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Users_1.default.updateOne({ _id: userId }, {
                Enlistments: {
                    shopRules: true,
                    email,
                    sms,
                    phone,
                    adjustedOffers,
                },
            });
        }
        catch (err) {
            throw err;
        }
    });
}
exports.default = {
    allowRecipientTemplate,
    updateRecipientDetailsTemplates,
    replaceRecipientDetailsTemplate,
    updateEnlistments,
};
