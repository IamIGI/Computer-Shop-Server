const express = require('express');
const router = express.Router();
const commentsController = require('../../controllers/commentsController');
const fileUpload = require('express-fileupload');
const fileExtLimiter = require('../../middleware/fileUpload/fileExtLimiter');
const fileSizeLimiter = require('../../middleware/fileUpload/fileSizeLimiter');

router.route('/averageScore/:productId').get(commentsController.getProductAverageScore);
router.route('/get').post(commentsController.getComments);
router
    .route('/add')
    .post(
        fileUpload({ createParentPath: true }),
        fileExtLimiter(['.png', '.jpg', 'jpeg']),
        fileSizeLimiter,
        commentsController.addComment
    );
router.route('/like').post(commentsController.likeComment);

module.exports = router;
