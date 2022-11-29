import { Request, Response } from 'express';
import { apiErrorHandler } from '../middleware/errorHandlers';
import promoCodesServices from '../services/promoCodes.services';

const addPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { category, product, code, type, value, expiredIn } = req.body; //category: general , category: delivery, category : products

    try {
        if (await promoCodesServices.checkIfPromoCodeExists(code))
            return res.status(400).json({ message: 'Code already exists in db' });

        await promoCodesServices.addPromoCodes(category, product, code, expiredIn, type, value);
        return res.status(200).json({ message: 'New promo code added to db' });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const category = req.params.category;

    try {
        const promoCodes = await promoCodesServices.filterPromoCodes(category);
        return res.status(200).json(promoCodes);
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const checkProducts = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { products, code } = req.body;

    if (!(await promoCodesServices.checkIfPromoCodeExists(code)))
        return res.status(200).json({ message: 'Bad code', errCode: '001' });
    const promoCodeType = await promoCodesServices.getPromoCodeType(code);

    let productsForDiscount = await promoCodesServices.getProductsForDiscount(products, promoCodeType);
    if (productsForDiscount.length === 0)
        return res.status(200).json({ message: 'No product for discount', errCode: '002' });
    productsForDiscount = promoCodesServices.getCheapestOneProduct(productsForDiscount);
    productsForDiscount = promoCodesServices.discountProduct(productsForDiscount, promoCodeType);
    return res.status(200).json(productsForDiscount);
};

export default { addPromoCodes, getPromoCodes, checkProducts };
