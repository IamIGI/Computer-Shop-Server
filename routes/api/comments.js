const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');

router.route('/add').post(commentsController.addComment);
router.route('/like').post(commentsController.likeComment);

module.exports = router;
