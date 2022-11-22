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
const Products_1 = __importDefault(require("../model/Products"));
const Comments_1 = __importDefault(require("../model/Comments"));
const errorHandlers_1 = require("../middleware/errorHandlers");
const productDetails_1 = __importDefault(require("../middleware/pdfCreator/productDetails"));
const product_services_1 = __importDefault(require("../services/product.services"));
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const { searchTerm, filters: { producers, processors, ram, disk, discounts }, sortBy, } = req.body;
    try {
        let response = yield Products_1.default.find({}).lean();
        let products = product_services_1.default.productsDiscount(response);
        let filteredProducts = product_services_1.default.filterProducts(products, ram, discounts, disk, producers, processors);
        let sortedProducts = yield product_services_1.default.sortProducts(filteredProducts, sortBy);
        let searchedProducts = product_services_1.default.searchProduct(sortedProducts, searchTerm);
        let productWithAdditionalParams = yield product_services_1.default.addCommentParamsToProductObject(searchedProducts);
        res.status(200).send(productWithAdditionalParams);
    }
    catch (err) {
        console.log(err);
        (0, errorHandlers_1.apiErrorHandler)(req, res, err); //send products as a response
    }
});
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const productCode = req.params.code;
    try {
        let product = yield Products_1.default.findOne({ _id: productCode }).lean();
        if (product === null)
            return res.status(404).send('No product match given code');
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
        const comments = yield Comments_1.default.findOne({ productId: productCode }).exec();
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
const getProductPDF = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`${req.originalUrl}`);
    const productCode = req.params.code;
    try {
        let product = yield Products_1.default.findOne({ _id: productCode }).lean();
        if (product === null)
            return res.status(404).send('No product match given code');
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
exports.default = { getAllProducts, getProduct, getProductPDF };
