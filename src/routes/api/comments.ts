import express from 'express';
import fileUpload from 'express-fileupload';
const router = express.Router();
import commentsController from '../../controllers/commentsController';
import fileExtLimiter from '../../middleware/fileUpload/fileExtLimiter';
import fileSizeLimiter from '../../middleware/fileUpload/fileSizeLimiter';

router.route('/averageScore/:productId').get(commentsController.getProductAverageScore);
router.route('/get').post(commentsController.getComments);
router.route('/add').post(
    fileUpload({ createParentPath: true }), // to fix
    fileExtLimiter(['.png', '.jpg', '.jpeg']),
    fileSizeLimiter,
    commentsController.addComment
);
router.route('/like').post(commentsController.likeComment);

export = router;
