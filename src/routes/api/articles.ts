import express from 'express';
const router = express.Router();
import articlesController from '../../controllers/articlesController';

router.route('/all').post(articlesController.getAllArticles);
router.route('/:id').get(articlesController.getArticle);

export = router;
