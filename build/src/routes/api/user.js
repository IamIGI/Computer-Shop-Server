"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const router = express.Router();
const userController = __importStar(require("../../controllers/userController"));
const roles_list_1 = __importDefault(require("../../config/roles_list"));
const verifyRoles_1 = __importDefault(require("../../middleware/verifyRoles"));
const ordersController = __importStar(require("../../controllers/ordersController"));
// logic----------
// account settings data
router
    .route('/accountInfo')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController.getUserData);
router
    .route('/accountData')
    .put((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController.updateAccountData);
router
    .route('/enlistments')
    .put((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), userController.updateEnlistments);
router.route('/delete').post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.User), userController.deleteUser);
//account order data
router
    .route('/orderhistory/:orderId')
    .get((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController.getUserHistoryItem);
router
    .route('/orderhistory')
    .post((0, verifyRoles_1.default)(roles_list_1.default.Admin, roles_list_1.default.Editor, roles_list_1.default.User), ordersController.getUserHistory);
exports.default = router;
