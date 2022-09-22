const express = require('express');
const router = express.Router();
const hotShootController = require('../../controllers/hotShootController');

// router.route('/').get(hotShootController.getHotShoot);
router.route('/timerchange').get(hotShootController.changeHotShootTimer);
router.route('/get').get(hotShootController.getHotShoot);

module.exports = router;
