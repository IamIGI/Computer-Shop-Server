import express from 'express';
import articlesController from '../../controllers/articlesController';

const router = express.Router();

router.route('/all/:type').get(articlesController.getAllArticles);
router.route('/homepage').get(articlesController.getArticlesForHomePage);
router.route('/:id').get(articlesController.getArticle);

export = router;
