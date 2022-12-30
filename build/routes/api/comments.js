"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const router = express_1.default.Router();
const commentsController_1 = __importDefault(require("../../controllers/commentsController"));
const fileExtLimiter_1 = __importDefault(require("../../middleware/fileUpload/fileExtLimiter"));
const fileSizeLimiter_1 = __importDefault(require("../../middleware/fileUpload/fileSizeLimiter"));
router.route('/averageScore/:productId').get(commentsController_1.default.getProductAverageScore);
router.route('/get').post(commentsController_1.default.getComments);
router.route('/add').post((0, express_fileupload_1.default)({ createParentPath: true }), // to fix
(0, fileExtLimiter_1.default)(['.png', '.jpg', '.jpeg']), fileSizeLimiter_1.default, commentsController_1.default.addComment);
router.route('/like').post(commentsController_1.default.likeComment);
module.exports = router;
