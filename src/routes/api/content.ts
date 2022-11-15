import express from 'express';
const router = express.Router();
import contentController from '../../controllers/contentController';

// logic----------
router.route('/about').get(contentController.getAboutPageData);

export = router;
