const Products = require('../model/Products');
const Comments = require('../model/Comments');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const productFilters = require('../middleware/filters/productFilters');
const commentsFilters = require('../middleware/filters/commentsFilters');

const getAllProducts = async (req, res) => {
    console.log(`${req.originalUrl}`);
    const {
        filters: { producers, processors, ram, disk },
        sortBy,
    } = req.body;

    try {
        const products = await Products.find({}).lean();

        let filteredProducts = productFilters.filterProducers(products, producers);
        filteredProducts = productFilters.filterProcessors(filteredProducts, processors);
        filteredProducts = productFilters.filterRAM(filteredProducts, ram);
        filteredProducts = productFilters.filterDisk(filteredProducts, disk);

        if (sortBy !== 'none') {
            if (sortBy === 'popular' || sortBy === 'rating') {
                const comments = await Comments.find({}).exec();
                if (sortBy === 'popular')
                    filteredProducts = productFilters.sortProductsByPopularity(filteredProducts, comments);
                if (sortBy === 'rating')
                    filteredProducts = await productFilters.sortProductsByRating(filteredProducts, comments);
            } else {
                filteredProducts = productFilters.sortProductsByPrice(filteredProducts, sortBy);
            }
        }

        //get averageScore and numberOfOpinions of filtered products
        let productId = '';
        let averageScore = 0;
        let productComments = {};
        for (let i = 0; i < filteredProducts.length; i++) {
            productId = filteredProducts[i]._id;
            averageScore = await commentsFilters.getAverageScore(productId);
            productComments = await Comments.findOne({ productId }).exec();
            filteredProducts[i].averageScore = averageScore.averageScore_View;
            filteredProducts[i].averageStars = averageScore.averageScore_Stars;
            filteredProducts[i].numberOfOpinions = productComments.comments.length;
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

    Products.findOne(
        {
            _id: productCode,
        },
        function (err, msg) {
            if (!err) {
                console.log({ message: 'return product data', productId: productCode });
                res.status(200).send(msg);
            } else {
                apiErrorHandler(req, res, err);
            }
        }
    );
};

module.exports = {
    getAllProducts,
    getProduct,
};
