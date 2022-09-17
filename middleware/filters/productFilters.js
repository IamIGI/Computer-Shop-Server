const commentsFilters = require('../../middleware/filters/commentsFilters');

function filterDiscounts(arr, discounts) {
    if (!discounts) return arr;
    let filtered = arr.filter((product) => {
        return product.special_offer.mode;
    });

    return filtered;
}

function filterProducers(arr, producers) {
    if (producers.length === 0) return arr;

    let filtered = [];
    let producer = '';
    let product = {};
    for (let i = 0; i < arr.length; i++) {
        product = arr[i];
        for (let j = 0; j < producers.length; j++) {
            producer = producers[j];
            if (product.brand.toLowerCase() === producer.toLowerCase()) filtered.push(product);
        }
    }
    return filtered;
}

function filterProcessors(arr, processors) {
    if (processors.length === 0) return arr;
    console.log(processors);
    let processor = '';
    let brand = '';
    let series = '';
    let filtered = [];
    let product = {};
    for (let i = 0; i < arr.length; i++) {
        product = arr[i];
        for (let j = 0; j < processors.length; j++) {
            processor = processors[j];
            brand = processor.split('-')[0];
            series = parseInt(processor.split('-')[1]);

            if (product.specification.processor.brand.toLowerCase() === brand.toLowerCase()) {
                if (product.specification.processor.series === series) filtered.push(product);
            }
        }
    }
    return filtered;
}

function filterRAM(arr, ram) {
    ram.min === '' && (ram.min = 0);
    ram.max === '' && (ram.max = 500);

    let product = '';
    let productRAM = 0;
    let filtered = [];

    for (let i = 0; i < arr.length; i++) {
        product = arr[i];
        productRAM = product.specification.ram.size;
        if (productRAM >= parseInt(ram.min) && productRAM <= parseInt(ram.max)) filtered.push(product);
    }
    return filtered;
}

function filterDisk(arr, disk) {
    disk.min === '' && (disk.min = 0);
    disk.max === '' && (disk.max = 4000);

    let product = '';
    let productDisk = 0;
    let filtered = [];

    for (let i = 0; i < arr.length; i++) {
        product = arr[i];
        productDisk = product.specification.disk.size;
        if (productDisk >= parseInt(disk.min) && productDisk <= parseInt(disk.max)) filtered.push(product);
    }
    return filtered;
}

function sortProductsByPrice(arr, prop) {
    let reverse = false;
    if (prop[0] === '-') {
        reverse = true;
        prop = prop.substr(1);
    }

    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while (i < len) {
            a = a[prop[i]];
            b = b[prop[i]];
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
    for (i = 0; i < sortedByPopularity.length; i++) {
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

async function sortProductsByRating(arrProducts, arrComments) {
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
    for (i = 0; i < sortedByRating.length; i++) {
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

module.exports = {
    filterDiscounts,
    filterProducers,
    filterProcessors,
    filterRAM,
    filterDisk,
    sortProductsByPrice,
    sortProductsByPopularity,
    sortProductsByRating,
};
