const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { apiErrorHandler } = require('../../middleware/errorHandlers');

// Schema
const productSchema = {
    code: Number,
};
const Product = mongoose.model('Products', productSchema);

// logic----------
router.route('/all').get(function (req, res) {
    console.log(`${req.originalUrl}`);

    Product.find({}, function (err, msg) {
        if (!err) {
            console.log('Status: 200');
            res.status(200).send(msg);
        } else {
            apiErrorHandler(req, res, err);
        }
    });
});

router.route('/:code').get(function (req, res) {
    console.log(`${req.originalUrl}`);

    const productCode = req.params.code;

    Product.findOne(
        {
            code: productCode,
        },
        function (err, msg) {
            if (!err) {
                console.log('Status: 200');
                res.status(200).send(msg);
            } else {
                apiErrorHandler(req, res, err);
            }
        }
    );
});

module.exports = router;
