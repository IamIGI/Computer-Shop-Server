import express from 'express';
const router = express.Router();
import logoutController from '../controllers/logoutController';

router.get('/', logoutController.handleLogout);

export = router;
