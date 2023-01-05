"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const generalDatasController_1 = __importDefault(require("../../controllers/generalDatasController"));
const router = express_1.default.Router();
router.route('/get/:type').get(generalDatasController_1.default.getGeneralData);
module.exports = router;
