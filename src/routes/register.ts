import express from 'express';
const router = express.Router();
import registerController from '../controllers/registerController';

// logic----------
router.route('/').post(registerController.handleNewUser);

export = router;
