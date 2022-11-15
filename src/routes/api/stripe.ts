import express from 'express';
const router = express.Router();
import stripePaymentController from '../../controllers/stripePaymentController';

router.route('/checkout').post(stripePaymentController.checkout);

export = router;
