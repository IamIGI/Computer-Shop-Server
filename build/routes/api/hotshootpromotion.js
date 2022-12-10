"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const hotShootController_1 = __importDefault(require("../../config/hotShootController"));
router.route('/timerchange').get(hotShootController_1.default.changeHotShootTimer);
router.route('/get').get(hotShootController_1.default.getHotShoot);
module.exports = router;
