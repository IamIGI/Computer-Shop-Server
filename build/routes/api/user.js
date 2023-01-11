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
const commentsController_1 = __importDefault(require("../../controllers/commentsController"));
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
router
    .route('/notifications')
    .put((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.updateNotifications);
//account user form order templates
router
    .route('/template/add')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.addRecipientTemplate);
router
    .route('/template/get')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.getRecipientTemplate);
router
    .route('/template/edit')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.editRecipientTemplate);
router
    .route('/template/delete')
    .delete((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController_1.default.deleteRecipientTemplate);
router.route('/delete').delete((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.User), userController_1.default.deleteUser);
//account order data
router
    .route('/orderhistory/:orderId')
    .get((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController_1.default.getUserHistoryItem);
router
    .route('/orderhistory')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController_1.default.getUserHistory);
//account comments
router
    .route('/comments/')
    .get((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), commentsController_1.default.getUserComments);
router;
module.exports = router;
