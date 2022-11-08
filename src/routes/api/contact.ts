import * as express from 'express';
const router = express.Router();
const contactController = require('../../controllers/contactController');
import * as fileUpload from 'express-fileupload';
const fileExtLimiter = require('../../middleware/fileUpload/fileExtLimiter');
const fileSizeLimiter = require('../../middleware/fileUpload/fileSizeLimiter');

router
    .route('/sendmessage')
    .post(
        fileUpload({ createParentPath: true }),
        fileExtLimiter(['.png', '.jpg', 'jpeg']),
        fileSizeLimiter,
        contactController.sendMessage
    );

module.exports = router;
