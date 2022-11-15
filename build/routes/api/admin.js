"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const hotShootController_1 = __importDefault(require("../../controllers/hotShootController"));
const roles_list_1 = __importDefault(require("../../config/roles_list"));
const verifyRoles_1 = __importDefault(require("../../middleware/verifyRoles"));
const webUpdatesController_1 = __importDefault(require("../../controllers/webUpdatesController"));
router.route('/hotShoot/set').post((0, verifyRoles_1.default)(roles_list_1.default.Admin), hotShootController_1.default.setHotShoot);
router.route('/webUpdates/update').post((0, verifyRoles_1.default)(roles_list_1.default.Admin), webUpdatesController_1.default.addNewUpdate);
module.exports = router;
