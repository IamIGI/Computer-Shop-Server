const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');

router.route('/averageScore/:productId').get(commentsController.getProductAverageScore);
router.route('/get').post(commentsController.getComments);
router.route('/add').post(commentsController.addComment);
router.route('/like').post(commentsController.likeComment);

module.exports = router;
