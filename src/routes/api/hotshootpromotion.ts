import express from 'express';
const router = express.Router();
import hotShootController from '../../config/hotShootController';

router.route('/timerchange').get(hotShootController.changeHotShootTimer);
router.route('/get').get(hotShootController.getHotShoot);

export = router;
