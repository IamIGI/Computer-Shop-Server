import express from 'express';
import generalDatasController from '../../controllers/generalDatasController';

const router = express.Router();

router.route('/get/:type').get(generalDatasController.getGeneralData);

export = router;
