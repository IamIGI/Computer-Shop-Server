import express from 'express';
const router = express.Router();
import refreshTokenController from '../controllers/refreshTokenController';

router.get('/', refreshTokenController.handleRefreshToken);

export = router;
