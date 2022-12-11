import HotShoot from '../model/HotShoot';
import hotShootPromotionServices from '../services/hotShootPromotion.services';
import { apiErrorHandler } from '../middleware/errorHandlers';
import schedule from 'node-schedule';
import { Request, Response } from 'express';
import commentsController from './commentsController';

//-------Schedule HotShootPromotion automatic change
//morning Promotion
schedule.scheduleJob('58 59 09 * * *', async function () {
    console.log(' hotShootController.ts -> timer start 10:00');
    await hotShootPromotionServices.changeHotShootPromotion(20);
});

//evening Promotion
schedule.scheduleJob('58 59 21 * * *', async function () {
    console.log(' hotShootController.ts -> timer start 22:00');
    await hotShootPromotionServices.changeHotShootPromotion(25);
});

const getHotShoot = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);

    try {
        const hotShoot = (await HotShoot.find({}).lean())[0];
        const productForHotShoot = hotShoot.promotion;
        return res.status(200).json(productForHotShoot);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

const changeHotShootTimer = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    try {
        const response = await hotShootPromotionServices.changeHotShootPromotion(20);
        console.log(response);
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

const setHotShoot = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    const { discountValue, product } = req.body;
    const response: number = hotShootPromotionServices.discountProduct(discountValue, product);
    res.status(200).json({ message: 'Hot Shoot promotion set', discountValue: response, productPrice: product.price });
};

export default { getHotShoot, changeHotShootTimer, setHotShoot };
