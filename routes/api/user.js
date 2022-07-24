const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// logic----------
router
    .route('/accountData')
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), userController.updateAccountData);
router.route('/enlistments').put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), userController.updateEnlistments); //change for everyone
router.route('/delete').delete(verifyRoles(ROLES_LIST.Admin), userController.deleteUser);

module.exports = router;
