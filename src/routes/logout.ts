import * as express from 'express';
const router = express.Router();
const logoutController = require('../controllers/logoutController');

router.get('/', logoutController.handleLogout);

module.exports = router;
