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
const errorHandlers_1 = require("../middleware/errorHandlers");
const promoCodes_services_1 = __importDefault(require("../services/promoCodes.services"));
const user_services_1 = __importDefault(require("../services/user.services"));
const addPromoCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { category, product, code, type, value, expiredIn } = req.body; //category: general , category: delivery, category : products
    try {
        if (yield promoCodes_services_1.default.checkIfPromoCodeExists(code))
            return res.status(400).json({ message: 'Code already exists in db' });
        yield promoCodes_services_1.default.addPromoCodes(category, product, code, expiredIn, type, value);
        return res.status(200).json({ message: 'New promo code added to db' });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const getPromoCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const category = req.params.category;
    try {
        const promoCodes = yield promoCodes_services_1.default.filterPromoCodes(category);
        return res.status(200).json(promoCodes);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
const checkProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { products, code, auth } = req.body;
    if (!(yield user_services_1.default.authenticateUser(res, auth)))
        return;
    if (!(yield promoCodes_services_1.default.checkIfPromoCodeExists(code)))
        return res.status(200).json({ message: 'Bad code', errCode: '001' });
    const promoCodeType = yield promoCodes_services_1.default.getPromoCodeType(code);
    if (yield promoCodes_services_1.default.isCodeAlreadyBeenUsedByUser(code, auth))
        return res.status(200).json({ message: 'code already been used by user', errCode: '003' });
    let productsForDiscount = yield promoCodes_services_1.default.getProductsForDiscount(products, promoCodeType);
    if (productsForDiscount.length === 0)
        return res.status(200).json({ message: 'No product for discount', errCode: '002' });
    productsForDiscount = promoCodes_services_1.default.getCheapestOneProduct(productsForDiscount);
    console.log(productsForDiscount);
    productsForDiscount = promoCodes_services_1.default.discountProduct(productsForDiscount, promoCodeType);
    return res.status(200).json(productsForDiscount);
});
exports.default = { addPromoCodes, getPromoCodes, checkProducts };
