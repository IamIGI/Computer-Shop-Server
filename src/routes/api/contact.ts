import express from 'express';
const router = express.Router();
import contactController from '../../controllers/contactController';
import fileUpload from 'express-fileupload';
import fileExtLimiter from '../../middleware/fileUpload/fileExtLimiter';
import fileSizeLimiter from '../../middleware/fileUpload/fileSizeLimiter';

router
    .route('/sendmessage')
    .post(
        fileUpload({ createParentPath: true }),
        fileExtLimiter(['.png', '.jpg', 'jpeg']),
        fileSizeLimiter,
        contactController.sendMessage
    );

export = router;
