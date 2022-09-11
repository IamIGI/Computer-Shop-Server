const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/contentController');

// logic----------
router.route('/about').get(contentController.getAboutPageData);

module.exports = router;
