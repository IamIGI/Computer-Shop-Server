import { Request, Response } from 'express';
import { apiErrorHandler } from '../middleware/errorHandlers';
import promoCodesServices from '../services/promoCodes.services';

const addPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { category, product, code, expiredIn } = req.body; //category: general , category: delivery, category : products

    try {
        if (await promoCodesServices.checkIfPromoCodeExists(code))
            return res.status(400).json({ message: 'Code already exists in db' });

        await promoCodesServices.addPromoCodes(category, product, code, expiredIn);
        return res.status(200).json({ message: 'New promo code added to db' });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

const getPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const category = req.params.category;
};

export default { addPromoCodes, getPromoCodes };
