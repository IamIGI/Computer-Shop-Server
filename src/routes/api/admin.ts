import express from 'express';
const router = express.Router();
import hotShootController from '../../controllers/hotShootController';
import ROLES_LIST from '../../config/roles_list';
import verifyRoles from '../../middleware/verifyRoles';
import webUpdatesController from '../../controllers/webUpdatesController';
import promoCodesController from '../../controllers/promoCodesController';

router.route('/hotShoot/set').post(verifyRoles(ROLES_LIST.Admin!), hotShootController.setHotShoot);
router.route('/webUpdates/update').post(verifyRoles(ROLES_LIST.Admin!), webUpdatesController.addNewUpdate);
router.route('/promoCodes/add').post(verifyRoles(ROLES_LIST.Admin!), promoCodesController.addPromoCodes);
router.route('/promoCodes/get/:category').post(verifyRoles(ROLES_LIST.Admin!), promoCodesController.getPromoCodes);

export = router;
