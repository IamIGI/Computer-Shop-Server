import * as express from 'express';
const router = express.Router();
const productsController = require('../../controllers/productsController');

// logic----------
router.route('/').post(productsController.getAllProducts);
router.route('/all').post(productsController.getAllProducts);
router.route('/:code').get(productsController.getProduct);
router.route('/pdf/:code').get(productsController.getProductPDF);

module.exports = router;
