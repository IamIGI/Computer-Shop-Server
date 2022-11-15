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
exports.getProductPDF = exports.getProduct = exports.getAllProducts = void 0;
const Products_1 = __importDefault(require("../model/Products"));
const Comments_1 = __importDefault(require("../model/Comments"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const productFilters_1 = __importDefault(require("../middleware/filters/productFilters"));
const commentsFilters_1 = __importDefault(require("../middleware/filters/commentsFilters"));
const productDetails_1 = __importDefault(require("../middleware/pdfCreator/productDetails"));
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { searchTerm, filters: { producers, processors, ram, disk, discounts }, sortBy, } = req.body;
    try {
        let products = yield Products_1.default.find({}).lean();
        //check if there is discount product
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            if (product.special_offer.mode) {
                product.price = product.price - product.special_offer.price;
            }
        }
        let filteredProducts = productFilters_1.default.filterRAM(products, ram);
        filteredProducts = productFilters_1.default.filterDiscounts(filteredProducts, discounts);
        filteredProducts = productFilters_1.default.filterDisk(filteredProducts, disk);
        filteredProducts = productFilters_1.default.filterProducers(filteredProducts, producers);
        filteredProducts = productFilters_1.default.filterProcessors(filteredProducts, processors);
        if (sortBy !== 'none') {
            if (sortBy === 'popular' || sortBy === 'rating') {
                const comments = yield Comments_1.default.find({}).exec();
                if (sortBy === 'popular')
                    filteredProducts = productFilters_1.default.sortProductsByPopularity(filteredProducts, comments);
                if (sortBy === 'rating')
                    filteredProducts = yield productFilters_1.default.sortProductsByRating(filteredProducts, comments);
            }
            else {
                filteredProducts = productFilters_1.default.sortProductsByPrice(filteredProducts, sortBy); //price, -price
            }
        }
        //SearchBar
        if (searchTerm !== '') {
            filteredProducts = filteredProducts.filter((product) => {
                return product.name.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        //get averageScore and numberOfOpinions of filtered products
        let productId = '';
        let averageScore = 0;
        let productComments = {};
        for (let i = 0; i < filteredProducts.length; i++) {
            productId = filteredProducts[i]._id;
            averageScore = yield commentsFilters_1.default.getAverageScore(productId);
            productComments = yield Comments_1.default.findOne({ productId }).exec();
            if (productComments) {
                filteredProducts[i].averageScore = averageScore.averageScore_View;
                filteredProducts[i].averageStars = averageScore.averageScore_Stars;
                filteredProducts[i].numberOfOpinions = productComments.comments.length;
            }
            else {
                filteredProducts[i].averageScore = 0;
                filteredProducts[i].averageStars = 0;
                filteredProducts[i].numberOfOpinions = 0;
            }
        }
        console.log('Status: 200');
        res.status(200).send(filteredProducts);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err); //send products as a response
    }
});
exports.getAllProducts = getAllProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const productCode = req.params.code;
    try {
        let product = yield Products_1.default.findOne({ _id: productCode }).lean();
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
        const comments = yield Comments_1.default.findOne({ productId: productCode }).exec();
        console.log(!comments);
        if (!comments) {
            product.numberOfOpinions = 0;
        }
        else {
            product.numberOfOpinions = comments.comments.length;
        }
        console.log({ message: 'return product data', productId: productCode });
        res.status(200).send(product);
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.getProduct = getProduct;
const getProductPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const productCode = req.params.code;
    try {
        let product = yield Products_1.default.findOne({ _id: productCode }).lean();
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=${product.name}.pdf`,
        });
        productDetails_1.default.buildPDF((chunk) => stream.write(chunk), () => stream.end(), product);
        console.log({ msg: 'Send product (PDF) successfully', productId: product._id });
    }
    catch (err) {
        (0, errorHandlers_1.apiErrorHandler)(req, res, err);
    }
});
exports.getProductPDF = getProductPDF;
