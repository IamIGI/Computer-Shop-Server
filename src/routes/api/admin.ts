import express from 'express';
const router = express.Router();
import hotShootController from '../../controllers/hotShootController';
import ROLES_LIST from '../../config/roles_list';
import verifyRoles from '../../middleware/verifyRoles';
import webUpdatesController from '../../controllers/webUpdatesController';

router.route('/hotShoot/set').post(verifyRoles(ROLES_LIST.Admin!), hotShootController.setHotShoot);
router.route('/webUpdates/update').post(verifyRoles(ROLES_LIST.Admin!), webUpdatesController.addNewUpdate);

export = router;
