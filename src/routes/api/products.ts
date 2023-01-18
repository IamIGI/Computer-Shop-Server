import express from 'express';
import productsController from '../../controllers/productsController';
import validateResources from '../../middleware/validateResources';
import { getProductPDFSchema, getProductSchema } from '../../schema/product.schema';

const router = express.Router();

// logic----------
router.route('/').post(productsController.getAllProducts);
router.route('/all').post(productsController.getAllProducts);
router.route('/home-page').get(productsController.getProductsForHomePage);
router.route('/:code').get(validateResources(getProductSchema), productsController.getProduct);
router.route('/pdf/:code').get(validateResources(getProductPDFSchema), productsController.getProductPDF);

export = router;
