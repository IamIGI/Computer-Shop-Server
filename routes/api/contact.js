const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactController');
const fileUpload = require('express-fileupload');
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
