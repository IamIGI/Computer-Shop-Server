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
/**add promo codes to db with expiration date given by number of days count from current date. Type must be: currency / percentage */
function addPromoCodes(category, product, code, expiredIn, type, value) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newPromoCode = new PromoCodes_1.default({
                category,
                product,
                code,
                type,
                value,
                createdAt: (0, format_1.default)(new Date(), 'yyyy.MM.dd'),
                expiredIn: (0, format_1.default)(new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * expiredIn), 'yyyy.MM.dd'),
            });
            const response = yield newPromoCode.save();
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
/** check if promo code exists in db */
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
/** filter promoCodes by given category: delivery, products, general */
function filterPromoCodes(category) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((category = 'none'))
            return yield PromoCodes_1.default.find({}).lean();
        return yield PromoCodes_1.default.find({ category }).lean();
    });
}
/** get  the promoCode type*/
function getPromoCodeType(code) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const promoCode = yield PromoCodes_1.default.findOne({ code }).exec();
            if (!promoCode)
                throw { err: 'bad code', reason: 'given code do not exists in db' };
            if (promoCode.category === 'products') {
                const { category, product, type, value } = promoCode;
                return {
                    category,
                    product,
                    type,
                    value,
                };
            }
            const { category, type, value } = promoCode;
            return {
                category,
                type,
                value,
            };
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
/** return products for discount, erase products that already are discounted, return just products of given brand if promoCode is about given product */
function getProductsForDiscount(products, promoCodeType) {
    return __awaiter(this, void 0, void 0, function* () {
        const productsWithoutDiscounts = products.filter((product) => product.isDiscount === false);
        if (productsWithoutDiscounts.length === 0)
            return [];
        if (promoCodeType.category === 'products') {
            if (!promoCodeType.product)
                throw { err: 'noProduct', reason: 'given code do not have brand to be discounted' };
            return productsWithoutDiscounts.filter((product) => product.brand.toLowerCase() === promoCodeType.product.toLowerCase());
        }
        return productsWithoutDiscounts;
    });
}
/** get the cheapest one product and change the value of  isDiscount key to true */
function getCheapestOneProduct(products) {
    let productForDiscount = products[0];
    products.map((item) => {
        if (productForDiscount.price > item.price)
            productForDiscount = item;
    });
    if (productForDiscount.quantity > 1)
        return [
            Object.assign(Object.assign({}, productForDiscount), { quantity: 1 }),
            Object.assign(Object.assign({}, productForDiscount), { quantity: productForDiscount.quantity - 1 }),
        ];
    return [productForDiscount];
}
/**Type must be: currency / percentage */
function discountProduct(products, promoCodeType) {
    let discountedProduct = products[0];
    let discountedPrice = 0;
    switch (promoCodeType.type) {
        case 'percentage':
            discountedPrice = Number((discountedProduct.price - discountedProduct.price * promoCodeType.value * 0.01).toFixed(2));
            break;
        case 'currency':
            discountedPrice = Number((discountedProduct.price - promoCodeType.value).toFixed(2));
            break;
        default:
            throw 'Bad promoCode type';
    }
    discountedProduct = Object.assign(Object.assign({}, discountedProduct), { price: discountedPrice, isDiscount: true, priceBeforeDiscount: discountedProduct.price });
    // create array with discounted Products
    products.shift();
    let discountedProducts = [];
    discountedProducts.push(discountedProduct);
    if (products[0] !== undefined)
        discountedProducts.push(products[0]);
    return discountedProducts;
}
exports.default = {
    addPromoCodes,
    checkIfPromoCodeExists,
    filterPromoCodes,
    getPromoCodeType,
    getProductsForDiscount,
    getCheapestOneProduct,
    discountProduct,
};
