const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactController');

router.route('/sendmessage').post(contactController.sendMessage);

module.exports = router;
