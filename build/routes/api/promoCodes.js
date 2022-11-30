"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const roles_list_1 = __importDefault(require("../../config/roles_list"));
const promoCodesController_1 = __importDefault(require("../../controllers/promoCodesController"));
const verifyRoles_1 = __importDefault(require("../../middleware/verifyRoles"));
const router = express_1.default.Router();
router.route('/checkproducts').post((0, verifyRoles_1.default)(roles_list_1.default.User), promoCodesController_1.default.checkProducts);
module.exports = router;
