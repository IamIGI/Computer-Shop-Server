"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const articlesController_1 = __importDefault(require("../../controllers/articlesController"));
router.route('/all').get(articlesController_1.default.getAllArticles);
router.route('/:id').get(articlesController_1.default.getArticle);
module.exports = router;
