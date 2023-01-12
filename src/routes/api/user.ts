import express from 'express';
const router = express.Router();
import userController from '../../controllers/userController';
import ROLES_LIST from '../../config/roles_list';
import verifyRoles from '../../middleware/verifyRoles';
import ordersController from '../../controllers/ordersController';
import commentsController from '../../controllers/commentsController';

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
router
    .route('/notifications')
    .put(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.updateNotifications);

//account user form order templates
router
    .route('/template/add')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.addRecipientTemplate);
router
    .route('/template/get')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.getRecipientTemplate);
router
    .route('/template/edit')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), userController.editRecipientTemplate);
router
    .route('/template/delete')
    .delete(
        verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!),
        userController.deleteRecipientTemplate
    );

router.route('/delete').delete(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.User!), userController.deleteUser);

//account order data
router
    .route('/orderhistory/:orderId')
    .get(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), ordersController.getUserHistoryItem);
router
    .route('/orderhistory')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), ordersController.getUserHistory);

//account comments
router
    .route('/comments/')
    .post(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), commentsController.getUserComments);
router;

router
    .route('/comments/deleteComment')
    .delete(verifyRoles(ROLES_LIST.Admin!, ROLES_LIST.Editor!, ROLES_LIST.User!), commentsController.deleteUserComment);
router;

export = router;
