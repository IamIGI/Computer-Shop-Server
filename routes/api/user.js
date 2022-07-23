const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

// logic----------
router.route('/accountData').put(userController.updateAccountData);
router.route('/enlistments').put(userController.updateEnlistments);
router.route('/delete').delete(userController.deleteUser);

module.exports = router;
