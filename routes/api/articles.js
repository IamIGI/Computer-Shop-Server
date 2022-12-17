"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const articlesController_1 = __importDefault(require("../../controllers/articlesController"));
const router = express_1.default.Router();
router.route('/all/:type').get(articlesController_1.default.getAllArticles);
router.route('/homepage').get(articlesController_1.default.getArticlesForHomePage);
router.route('/:id').get(articlesController_1.default.getArticle);
module.exports = router;
