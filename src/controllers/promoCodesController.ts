import { Request, Response } from 'express';
import { apiErrorHandler } from '../middleware/errorHandlers';
import promoCodesServices from '../services/promoCodes.services';

const addPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { category, product, code } = req.body; //category: general , category: delivery, category : products

    try {
        const response = await promoCodesServices.updatePromoCodes(category, product, code);
        if ('err' in response) return res.status(400).json(response);

        return res.status(200).json({ message: 'New promo code added to db' });
    } catch (err) {
        apiErrorHandler(req, res, err as Error);
    }
};

//when user send promo codes, we will first check for code in given product, then in general
//all codes for delivery have to start with DELIVERY_ name
//all codes have to have name which begin with category, for example :
// delivery = DELIVERY_<code>
// product  = PRODUCT_<code>
// no category = _<code>

const getPromoCodes = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const category = req.params.category;
};

export default { addPromoCodes, getPromoCodes };
