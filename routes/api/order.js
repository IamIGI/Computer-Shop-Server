"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const ordersController_1 = __importDefault(require("../../controllers/ordersController"));
// logic----------
router.route('/make').post(ordersController_1.default.makeOrder);
router.route('/pdf/:orderId').get(ordersController_1.default.getOrderPDF);
module.exports = router;
