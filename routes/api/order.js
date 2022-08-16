const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/ordersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// logic----------

router
    .route('/make')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), ordersController.makeOrder);
router
    .route('/history/:orderId')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), ordersController.getUserHistoryItem);
router
    .route('/history')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), ordersController.getUserHistory);

module.exports = router;
