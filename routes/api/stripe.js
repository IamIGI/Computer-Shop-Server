"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const stripePaymentController_1 = __importDefault(require("../../controllers/stripePaymentController"));
router.route('/checkout').post(stripePaymentController_1.default.checkout);
module.exports = router;
