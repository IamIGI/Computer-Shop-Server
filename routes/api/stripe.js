const express = require('express');
const router = express.Router();
const stripePaymentController = require('../../controllers/stripePaymentController');

router.route('/checkout').post(stripePaymentController.checkout);

module.exports = router;
