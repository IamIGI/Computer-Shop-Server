"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const contactController_1 = __importDefault(require("../../controllers/contactController"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const fileExtLimiter_1 = __importDefault(require("../../middleware/fileUpload/fileExtLimiter"));
const fileSizeLimiter_1 = __importDefault(require("../../middleware/fileUpload/fileSizeLimiter"));
router
    .route('/sendmessage')
    .post((0, express_fileupload_1.default)({ createParentPath: true }), (0, fileExtLimiter_1.default)(['.png', '.jpg', 'jpeg']), fileSizeLimiter_1.default, contactController_1.default.sendMessage);
module.exports = router;
