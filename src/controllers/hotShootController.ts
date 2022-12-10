import HotShoot from '../model/HotShoot';
import changeHotShootPromotion from '../middleware/externalFunctions/hotShootPromotion/changeHotShootPromotion';
import { apiErrorHandler } from '../middleware/errorHandlers';
import schedule from 'node-schedule';
import { Request, Response } from 'express';

//-------Schedule HotShootPromotion automatic change
//morning Promotion
schedule.scheduleJob('58 59 09 * * *', async function () {
    console.log(' hotShootController.ts -> timer start 10:00');
    await changeHotShootPromotion(700);
});

//evening Promotion
schedule.scheduleJob('58 59 21 * * *', async function () {
    console.log(' hotShootController.ts -> timer start 22:00');
    await changeHotShootPromotion(500);
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
        const response = await changeHotShootPromotion(600);
        console.log(response);
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err as Error);
    }
};

const setHotShoot = async (req: Request, res: Response) => {
    console.log(`${req.originalUrl}`);
    res.status(200).json({ message: 'Hot Shoot promotion set', send: req.body });
};

export default { getHotShoot, changeHotShootTimer, setHotShoot };
