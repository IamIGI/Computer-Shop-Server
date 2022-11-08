import * as express from 'express';
const router = express.Router();
const hotShootController = require('../../controllers/hotShootController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');
const webUpdatesController = require('../../controllers/webUpdatesController');

router.route('/hotShoot/set').post(verifyRoles(ROLES_LIST.Admin), hotShootController.setHotShoot);
router.route('/webUpdates/update').post(verifyRoles(ROLES_LIST.Admin), webUpdatesController.addNewUpdate);

module.exports = router;
