"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = __importDefault(require("../../controllers/userController"));
const roles_list_1 = __importDefault(require("../../config/roles_list"));
const verifyRoles_1 = __importDefault(require("../../middleware/verifyRoles"));
const ordersController_1 = __importDefault(require("../../controllers/ordersController"));
// logic----------
// account settings data
router
    .route('/accountInfo')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.getUserData);
router
    .route('/accountData')
    .put((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.updateAccountData);
router
    .route('/enlistments')
    .put((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.updateEnlistments);
router.route('/delete').post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.User), userController_1.default.deleteUser);
//account order data
router
    .route('/orderhistory/:orderId')
    .get((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController_1.default.getUserHistoryItem);
router
    .route('/orderhistory')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController_1.default.getUserHistory);
module.exports = router;
