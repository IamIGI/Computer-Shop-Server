import express from 'express';
const router = express.Router();
import webUpdatesController from '../../controllers/webUpdatesController';

router.route('/get').get(webUpdatesController.getAllUpdates);
router.route('/pdf').get(webUpdatesController.getPDF);

export = router;
