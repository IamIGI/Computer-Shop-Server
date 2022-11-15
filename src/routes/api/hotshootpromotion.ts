import express from 'express';
const router = express.Router();
import hotShootController from '../../controllers/hotShootController';

router.route('/timerchange').get(hotShootController.changeHotShootTimer);
router.route('/get').get(hotShootController.getHotShoot);

export = router;
