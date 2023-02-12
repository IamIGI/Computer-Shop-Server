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
const productFilters_1 = __importDefault(require("../middleware/filters/productFilters"));
const Comments_1 = __importDefault(require("../model/Comments"));
const commentsFilters_1 = __importDefault(require("../middleware/filters/commentsFilters"));
/** add averageScore, averageStore, numberOfOpinions to product object */
function addCommentParamsToProductObject(products) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            for (let i = 0; i < products.length; i++) {
                let productId = products[i]._id;
                let averageScore = yield commentsFilters_1.default.getAverageScore(productId);
                let productComments = yield Comments_1.default.findOne({ productId }).exec();
                if (productComments) {
                    products[i].averageScore = averageScore.averageScore_View;
                    products[i].averageStars = averageScore.averageScore_Stars;
                    products[i].numberOfOpinions = productComments.comments.length;
                }
                else {
                    products[i].averageScore = 0;
                    products[i].averageStars = 0;
                    products[i].numberOfOpinions = 0;
                }
            }
            return products;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
/** search product by value user typed in searchbar */
function searchProduct(products, searchTerm) {
    if (searchTerm === '')
        return products;
    return products.filter((product) => {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
}
/** check for product discounts in db / hotShoot system discounts */
function productsDiscount(products) {
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        if (product.special_offer.mode) {
            product.price = Number((product.price - product.special_offer.price).toFixed(2));
        }
    }
    return products;
}
/** filter products by ram, discounts, disk, producers, processors */
function filterProducts(products, ram, discounts, disk, producers, processors) {
    let filteredProducts = productFilters_1.default.filterRAM(products, ram);
    filteredProducts = productFilters_1.default.filterDiscounts(filteredProducts, discounts);
    filteredProducts = productFilters_1.default.filterDisk(filteredProducts, disk);
    filteredProducts = productFilters_1.default.filterProducers(filteredProducts, producers);
    filteredProducts = productFilters_1.default.filterProcessors(filteredProducts, processors);
    return filteredProducts;
}
/**Sort products by given key words: none, popular, rating, price , -price*/
function sortProducts(products, sortBy) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let sortedProducts = products;
            if (sortBy !== 'none') {
                if (sortBy === 'popular' || sortBy === 'rating') {
                    const comments = yield Comments_1.default.find({}).exec();
                    if (sortBy === 'popular')
                        sortedProducts = productFilters_1.default.sortProductsByPopularity(products, comments);
                    if (sortBy === 'rating')
                        sortedProducts = yield productFilters_1.default.sortProductsByRating(products, comments);
                }
                else {
                    sortedProducts = productFilters_1.default.sortProductsByPrice(products, sortBy); //price, -price
                }
            }
            return sortedProducts;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = { addCommentParamsToProductObject, searchProduct, productsDiscount, filterProducts, sortProducts };
