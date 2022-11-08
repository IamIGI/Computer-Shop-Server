import * as express from 'express';
const router = express.Router();
const ordersController = require('../../controllers/ordersController');

// logic----------

router.route('/make').post(ordersController.makeOrder);
router.route('/pdf/:orderId').get(ordersController.getOrderPDF);

module.exports = router;
