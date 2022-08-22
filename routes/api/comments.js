const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');

router.route('/add').post(commentsController.addComment);

module.exports = router;
