const Products = require('../model/Products');
const { apiErrorHandler } = require('../middleware/errorHandlers');

const getAllProducts = async (req, res) => {
    console.log(`${req.originalUrl}`);

    Products.find({}, function (err, msg) {
        if (!err) {
            console.log('Status: 200');
            res.status(200).send(msg);
        } else {
            apiErrorHandler(req, res, err); //send products as a response
        }
    });
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
