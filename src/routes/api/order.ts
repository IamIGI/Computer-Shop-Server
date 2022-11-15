import express from 'express';
const router = express.Router();
import ordersController from '../../controllers/ordersController';

// logic----------

router.route('/make').post(ordersController.makeOrder);
router.route('/pdf/:orderId').get(ordersController.getOrderPDF);

export = router;
