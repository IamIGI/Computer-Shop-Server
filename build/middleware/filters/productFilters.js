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
exports.sortProductsByRating = exports.sortProductsByPopularity = exports.sortProductsByPrice = exports.filterDisk = exports.filterRAM = exports.filterProcessors = exports.filterProducers = exports.filterDiscounts = void 0;
const commentsFilters_1 = __importDefault(require("../../middleware/filters/commentsFilters"));
function filterDiscounts(arr, discounts) {
    if (!discounts)
        return arr;
    let filtered = arr.filter((product) => {
        return product.special_offer.mode;
    });
    return filtered;
}
exports.filterDiscounts = filterDiscounts;
function filterProducers(arr, producers) {
    if (producers.length === 0)
        return arr;
    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        for (let j = 0; j < producers.length; j++) {
            let producer = producers[j];
            if (product.brand.toLowerCase() === producer.toLowerCase())
                filtered.push(product);
        }
    }
    return filtered;
}
exports.filterProducers = filterProducers;
function filterProcessors(arr, processors) {
    if (processors.length === 0)
        return arr;
    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        for (let j = 0; j < processors.length; j++) {
            let processor = processors[j];
            let brand = processor.split('-')[0];
            let series = parseInt(processor.split('-')[1]);
            if (product.specification.processor.brand.toLowerCase() === brand.toLowerCase()) {
                if (product.specification.processor.series === series)
                    filtered.push(product);
            }
        }
    }
    return filtered;
}
exports.filterProcessors = filterProcessors;
function filterRAM(arr, ram) {
    ram.min === '' && (ram.min = 0);
    ram.max === '' && (ram.max = 500);
    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        let productRAM = product.specification.ram.size;
        if (productRAM >= ram.min && productRAM <= ram.max)
            filtered.push(product);
    }
    return filtered;
}
exports.filterRAM = filterRAM;
function filterDisk(arr, disk) {
    disk.min === '' && (disk.min = 0);
    disk.max === '' && (disk.max = 4000);
    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        let productDisk = product.specification.disk.size;
        if (productDisk >= disk.min && productDisk <= disk.max)
            filtered.push(product);
    }
    return filtered;
}
exports.filterDisk = filterDisk;
function sortProductsByPrice(arr, prop) {
    let reverse = false;
    if (prop[0] === '-') {
        reverse = true;
        prop = prop.substr(1);
    }
    let ArrProp = prop.split('.');
    var len = ArrProp.length;
    arr.sort(function (a, b) {
        var i = 0;
        while (i < len) {
            a = a[ArrProp[i]];
            b = b[ArrProp[i]];
            i++;
        }
        if (a < b) {
            return 1;
        }
        else if (a > b) {
            return -1;
        }
        else {
            return 0;
        }
    });
    if (reverse)
        return arr.reverse();
    return arr;
}
exports.sortProductsByPrice = sortProductsByPrice;
function sortProductsByPopularity(arrProducts, arrComments) {
    let productComments = [];
    //get number of comments of each product
    for (let i = 0; i < arrComments.length; i++) {
        let product = arrComments[i];
        productComments.push({ productId: product.productId, numberOfComments: product.comments.length });
    }
    //sort products by most comments //using sortProductsByPrice cuz this sort by given value
    const sortedByPopularity = sortProductsByPrice(productComments, 'numberOfComments');
    //get just id of product
    let order = [];
    for (let i = 0; i < sortedByPopularity.length; i++) {
        order.push(sortedByPopularity[i].productId);
    }
    //sort products by given popularity list
    const sortByObject = order.reduce((obj, item, index) => {
        return Object.assign(Object.assign({}, obj), { [item]: index });
    }, {});
    return arrProducts.sort((a, b) => sortByObject[a._id] - sortByObject[b._id]);
}
exports.sortProductsByPopularity = sortProductsByPopularity;
function sortProductsByRating(arrProducts, arrComments) {
    return __awaiter(this, void 0, void 0, function* () {
        let productsAverageScore = [];
        let productId = '';
        //get averageScore of each product
        for (let i = 0; i < arrComments.length; i++) {
            productId = arrComments[i].productId;
            let response = yield commentsFilters_1.default.getAverageScore(productId);
            productsAverageScore.push({ productId, averageScore: response.averageScore_View });
        }
        //sort products by rating //using sortProductsByPrice cuz this sort by given value
        const sortedByRating = sortProductsByPrice(productsAverageScore, 'averageScore');
        //get just id of product
        let order = [];
        for (let i = 0; i < sortedByRating.length; i++) {
            order.push(sortedByRating[i].productId);
        }
        //sort products by given popularity list
        const sortByObject = order.reduce((obj, item, index) => {
            return Object.assign(Object.assign({}, obj), { [item]: index });
        }, {});
        const date = arrProducts.sort((a, b) => sortByObject[a._id] - sortByObject[b._id]);
        return date;
    });
}
exports.sortProductsByRating = sortProductsByRating;
exports.default = {
    filterDiscounts,
    filterProducers,
    filterProcessors,
    filterRAM,
    filterDisk,
    sortProductsByPrice,
    sortProductsByPopularity,
    sortProductsByRating,
};
