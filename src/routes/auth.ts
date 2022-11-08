import * as express from 'express';
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.handleLogin);

module.exports = router;
