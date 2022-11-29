import express from 'express';
import promoCodesController from '../../controllers/promoCodesController';

const router = express.Router();

router.route('/checkproducts').post(promoCodesController.checkProducts);

export = router;
