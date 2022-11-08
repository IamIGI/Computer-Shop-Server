const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');

// logic----------
router.route('/').post(registerController.handleNewUser);

module.exports = router;
