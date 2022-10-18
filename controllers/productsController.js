const Products = require('../model/Products');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const productFilters = require('../middleware/filters/productFilters');
const commentsFilters = require('../middleware/filters/commentsFilters');
const productPDF = require('../middleware/pdfCreator/productDetails');

const getAllProducts = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const {
        searchTerm,
        filters: { producers, processors, ram, disk, discounts },
        sortBy,
    } = req.body;
    try {
        let products = await Products.find({}).lean();
        //check if there is discount product
        for (let i = 0; i < products.length; i++) {
            let product = products[i];
            if (product.special_offer.mode) {
                product.price = product.price - product.special_offer.price;
            }
        }

        let filteredProducts = productFilters.filterRAM(products, ram);
        filteredProducts = productFilters.filterDiscounts(filteredProducts, discounts);
        filteredProducts = productFilters.filterDisk(filteredProducts, disk);
        filteredProducts = productFilters.filterProducers(filteredProducts, producers);
        filteredProducts = productFilters.filterProcessors(filteredProducts, processors);

        if (sortBy !== 'none') {
            if (sortBy === 'popular' || sortBy === 'rating') {
                const comments = await Comments.find({}).exec();
                if (sortBy === 'popular')
                    filteredProducts = productFilters.sortProductsByPopularity(filteredProducts, comments);
                if (sortBy === 'rating')
                    filteredProducts = await productFilters.sortProductsByRating(filteredProducts, comments);
            } else {
                filteredProducts = productFilters.sortProductsByPrice(filteredProducts, sortBy); //price, -price
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
            averageScore = await commentsFilters.getAverageScore(productId);
            productComments = await Comments.findOne({ productId }).exec();
            if (productComments) {
                filteredProducts[i].averageScore = averageScore.averageScore_View;
                filteredProducts[i].averageStars = averageScore.averageScore_Stars;
                filteredProducts[i].numberOfOpinions = productComments.comments.length;
            } else {
                filteredProducts[i].averageScore = 0;
                filteredProducts[i].averageStars = 0;
                filteredProducts[i].numberOfOpinions = 0;
            }
        }

        console.log('Status: 200');
        res.status(200).send(filteredProducts);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err); //send products as a response
    }
};

const getProduct = async (req, res) => {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;
    try {
        let product = await Products.findOne({ _id: productCode }).lean();
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }
        const comments = await Comments.findOne({ productId: productCode }).exec();
        console.log(!comments);
        if (!comments) {
            product.numberOfOpinions = 0;
        } else {
            product.numberOfOpinions = comments.comments.length;
        }

        console.log({ message: 'return product data', productId: productCode });
        res.status(200).send(product);
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

const getProductPDF = async (req, res) => {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;
    try {
        let product = await Products.findOne({ _id: productCode }).lean();
        if (product.special_offer.mode) {
            product.price = product.price - product.special_offer.price;
        }

        const stream = res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment;filename=${product.name}.pdf`,
        });
        productPDF.buildPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            product
        );

        console.log({ msg: 'Send product (PDF) successfully', productId: product._id });
    } catch (err) {
        apiErrorHandler(req, res, err);
    }
};

module.exports = {
    getAllProducts,
    getProduct,
    getProductPDF,
};
