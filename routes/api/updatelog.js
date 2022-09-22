const express = require('express');
const router = express.Router();
const webUpdatesController = require('../../controllers/webUpdatesController');

router.route('/get').get(webUpdatesController.getAllUpdates);

module.exports = router;
