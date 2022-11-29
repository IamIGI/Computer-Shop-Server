"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const promoCodesController_1 = __importDefault(require("../../controllers/promoCodesController"));
const router = express_1.default.Router();
router.route('/checkproducts').post(promoCodesController_1.default.checkProducts);
module.exports = router;
