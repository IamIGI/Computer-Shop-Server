import commentsFilters from '../../middleware/filters/commentsFilters';
import { CommentInput } from '../../model/Comments';
import { ProductDocument } from '../../model/Products';

export function filterDiscounts(arr: ProductDocument[], discounts: boolean) {
    if (!discounts) return arr;
    let filtered = arr.filter((product) => {
        return product.special_offer.mode;
    });

    return filtered;
}

export function filterProducers(arr: ProductDocument[], producers: string[]) {
    if (producers.length === 0) return arr;

    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        for (let j = 0; j < producers.length; j++) {
            let producer = producers[j];
            if (product.brand.toLowerCase() === producer.toLowerCase()) filtered.push(product);
        }
    }
    return filtered;
}

export function filterProcessors(arr: ProductDocument[], processors: string[]) {
    if (processors.length === 0) return arr;

    let filtered = [];

    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        for (let j = 0; j < processors.length; j++) {
            let processor = processors[j];
            let brand = processor.split('-')[0];
            let series = parseInt(processor.split('-')[1]);

            if (product.specification.processor.brand.toLowerCase() === brand.toLowerCase()) {
                if (product.specification.processor.series === series) filtered.push(product);
            }
        }
    }
    return filtered;
}

export function filterRAM(arr: ProductDocument[], ram: { min: number | string; max: number | string }) {
    ram.min === '' && (ram.min = 0);
    ram.max === '' && (ram.max = 500);

    let filtered = [];

    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        let productRAM = product.specification.ram.size;
        if (productRAM >= ram.min! && productRAM <= ram.max!) filtered.push(product);
    }
    return filtered;
}

export function filterDisk(arr: ProductDocument[], disk: { min: number | string; max: number | string }) {
    disk.min === '' && (disk.min = 0);
    disk.max === '' && (disk.max = 4000);

    let filtered = [];

    for (let i = 0; i < arr.length; i++) {
        let product = arr[i];
        let productDisk = product.specification.disk.size;
        if (productDisk >= disk.min && productDisk <= disk.max) filtered.push(product);
    }
    return filtered;
}

export function sortProductsByPrice(arr: any, prop: string) {
    let reverse = false;
    if (prop[0] === '-') {
        reverse = true;
        prop = prop.substr(1);
    }

    let ArrProp = prop.split('.');
    var len = ArrProp.length;

    arr.sort(function (a: any, b: any) {
        var i = 0;
        while (i < len) {
            a = a[ArrProp[i]];
            b = b[ArrProp[i]];
            i++;
        }
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
    if (reverse) return arr.reverse();
    return arr;
}

export function sortProductsByPopularity(arrProducts: ProductDocument[], arrComments: CommentInput[]) {
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
        return {
            ...obj,
            [item]: index,
        };
    }, {});
    return arrProducts.sort((a, b) => sortByObject[a._id] - sortByObject[b._id]);
}

export async function sortProductsByRating(arrProducts: ProductDocument[], arrComments: CommentInput[]) {
    let productsAverageScore = [];
    let productId = '';
    //get averageScore of each product
    for (let i = 0; i < arrComments.length; i++) {
        productId = arrComments[i].productId;
        let response = await commentsFilters.getAverageScore(productId);
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
        return {
            ...obj,
            [item]: index,
        };
    }, {});
    const date = arrProducts.sort((a, b) => sortByObject[a._id] - sortByObject[b._id]);
    return date;
}

export default {
    filterDiscounts,
    filterProducers,
    filterProcessors,
    filterRAM,
    filterDisk,
    sortProductsByPrice,
    sortProductsByPopularity,
    sortProductsByRating,
};
