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
function updatePromoCodes(category, product, code) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentId = '6384898726c34784116adace';
        console.log(category === 'products');
        let response;
        switch (category) {
            case 'general':
                response = yield PromoCodes_1.default.updateOne({
                    _id: documentId,
                }, {
                    $push: { general: code },
                });
                break;
            case 'delivery':
                response = yield PromoCodes_1.default.updateOne({
                    _id: documentId,
                }, {
                    $push: { 'category.delivery': code },
                });
                break;
            case 'products':
                switch (product) {
                    case 'dell':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.dell': code },
                        });
                        break;
                    case 'msi':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.msi': code },
                        });
                        break;
                    case 'hp':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.hp': code },
                        });
                        break;
                    case 'asus':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.asus': code },
                        });
                        break;
                    case 'apple':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.apple': code },
                        });
                        break;
                    case 'microsoft':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.microsoft': code },
                        });
                        break;
                    case 'general':
                        response = yield PromoCodes_1.default.updateOne({
                            _id: documentId,
                        }, {
                            $push: { 'category.products.general': code },
                        });
                        break;
                    default:
                        response = { err: 'bad product key', message: 'given product do not exists' };
                }
                break;
            default:
                response = {
                    err: 'bad category key',
                    message: 'given category do not exists',
                    category,
                    isTrue: category === 'products',
                };
                console.log('given category do not exists');
        }
        yield PromoCodes_1.default.updateOne({
            _id: documentId,
        }, {
            $push: { allCodes: code },
        });
        return response;
    });
}
exports.default = { updatePromoCodes };
