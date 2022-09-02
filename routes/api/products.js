const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/productsController');

// logic----------
router.route('/').get(productsController.getAllProducts);
router.route('/all').post(productsController.getAllProducts);
router.route('/:code').get(productsController.getProduct);

module.exports = router;
