"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const productsController_1 = __importDefault(require("../../controllers/productsController"));
const validateResources_1 = __importDefault(require("../../middleware/validateResources"));
const product_schema_1 = require("../../schema/product.schema");
const router = express_1.default.Router();
// logic----------
router.route('/').post(productsController_1.default.getAllProducts);
router.route('/all').post(productsController_1.default.getAllProducts);
router.route('/home-page').get(productsController_1.default.getProductsForHomePage);
router.route('/:code').get((0, validateResources_1.default)(product_schema_1.getProductSchema), productsController_1.default.getProduct);
router.route('/pdf/:code').get((0, validateResources_1.default)(product_schema_1.getProductPDFSchema), productsController_1.default.getProductPDF);
module.exports = router;
