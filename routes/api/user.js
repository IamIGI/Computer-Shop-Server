const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// logic----------
router
    .route('/accountInfo')
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), userController.getUserData);
router
    .route('/accountData')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), userController.updateAccountData);
router
    .route('/enlistments')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), userController.updateEnlistments);

router.route('/delete').post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.User), userController.deleteUser);

module.exports = router;
