"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const webUpdatesController_1 = __importDefault(require("../../controllers/webUpdatesController"));
router.route('/get').get(webUpdatesController_1.default.getAllUpdates);
router.route('/pdf').get(webUpdatesController_1.default.getPDF);
module.exports = router;
