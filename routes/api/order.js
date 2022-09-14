const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/ordersController');
const ROLES_LIST = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// logic----------

router.route('/make').post(ordersController.makeOrder);

module.exports = router;
