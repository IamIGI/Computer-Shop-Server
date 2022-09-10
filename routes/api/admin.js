const express = require('express');
const router = express.Router();
const hotShootController = require('../../controllers/hotShootController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

router.route('/hotShoot/set').post(verifyRoles(ROLES_LIST.Admin), hotShootController.setHotShoot);

module.exports = router;
