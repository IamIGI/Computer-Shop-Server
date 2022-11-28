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
const PromoCodes_1 = __importDefault(require("../model/PromoCodes"));
const format_1 = __importDefault(require("date-fns/format"));
function addPromoCodes(category, product, code, expiredIn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newPromoCode = new PromoCodes_1.default({
                category,
                product,
                code,
                createdAt: (0, format_1.default)(new Date(), 'yyyy.MM.dd'),
                expiredIn: (0, format_1.default)(new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * expiredIn), 'yyyy.MM.dd'),
            });
            const response = yield newPromoCode.save();
            console.log(response);
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
function checkIfPromoCodeExists(code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const exists = yield PromoCodes_1.default.findOne({ code }).exec();
            if (!exists)
                return false;
            return true;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = { addPromoCodes, checkIfPromoCodeExists };
