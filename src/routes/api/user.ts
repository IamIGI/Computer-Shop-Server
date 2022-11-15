import express from 'express';
const router = express.Router();
import userController from '../../controllers/userController';
import ROLES_LIST from '../../config/roles_list';
import verifyRoles from '../../middleware/verifyRoles';
import ordersController from '../../controllers/ordersController';

// logic----------
// account settings data
router
    .route('/accountInfo')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.getUserData);
router
    .route('/accountData')
    .put(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.updateAccountData);
router
    .route('/enlistments')
    .put(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.updateEnlistments);

router.route('/delete').post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.User!), userController.deleteUser);

//account order data
router
    .route('/orderhistory/:orderId')
    .get(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), ordersController.getUserHistoryItem);
router
    .route('/orderhistory')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), ordersController.getUserHistory);

export = router;
