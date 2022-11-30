import express from 'express';
import ROLES_LIST from '../../config/roles_list';
import promoCodesController from '../../controllers/promoCodesController';
import verifyRoles from '../../middleware/verifyRoles';

const router = express.Router();

router.route('/checkproducts').post(verifyRoles(ROLES_LIST.User!), promoCodesController.checkProducts);

export = router;
