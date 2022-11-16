import express from 'express';
const router = express.Router();
import articlesController from '../../controllers/articlesController';

router.route('/all').get(articlesController.getAllArticles);

export = router;
