import * as express from 'express';
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController');

router.get('/', refreshTokenController.handleRefreshToken);

module.exports = router;
