const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/productsController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// logic----------
router
    .route('/all')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), productsController.getAllProducts);
router
    .route('/:code')
    .get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor, ROLES_LIST.User), productsController.getProduct);

module.exports = router;
