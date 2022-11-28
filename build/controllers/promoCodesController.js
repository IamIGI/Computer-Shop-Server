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
const addPromoCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { category, product, code } = req.body; //category: general , category: delivery, category : products
    try {
        const response = yield promoCodes_services_1.default.updatePromoCodes(category, product, code);
        if ('err' in response)
            return res.status(400).json(response);
        return res.status(200).json({ message: 'New promo code added to db' });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
//when user send promo codes, we will first check for code in given product, then in general
//all codes for delivery have to start with DELIVERY_ name
//all codes have to have name which begin with category, for example :
// delivery = DELIVERY_<code>
// product  = PRODUCT_<code>
// no category = _<code>
const getPromoCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const category = req.params.category;
});
exports.default = { addPromoCodes, getPromoCodes };
