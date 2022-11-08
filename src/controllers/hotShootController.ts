const HotShoot = require('../model/HotShoot');
const changeHotShootPromotion = require('../middleware/externalFunctions/hotShootPromotion/changeHotShootPromotion');
const { apiErrorHandler } = require('../middleware/errorHandlers');
import * as schedule from 'node-schedule';

//-------Schedule HotShootPromotion automatic change
//morning Promotion
schedule.scheduleJob('58 59 09 * * *', async function () {
    const response = await changeHotShootPromotion(700);
    console.log(response);
});

//evening Promotion
schedule.scheduleJob('58 59 21 * * *', async function () {
    const response = await changeHotShootPromotion(500);
    console.log(response);
});

const getHotShoot = async (req, res) => {
    console.log(`${req.originalUrl}`);

    try {
        const hotShoot = (await HotShoot.find({}).lean())[0];
        productForHotShoot = hotShoot.promotion;
        return res.status(200).json(productForHotShoot);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

const changeHotShootTimer = async (req, res) => {
    console.log(`${req.originalUrl}`);
    try {
        const response = await changeHotShootPromotion(600);
        console.log(response);
        return res.status(200).json(response);
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

const setHotShoot = async (req, res) => {
    console.log(`${req.originalUrl}`);
    res.status(200).json({ message: 'Hot Shoot promotion set', send: req.body });
};

module.exports = {
    changeHotShootTimer,
    getHotShoot,
    setHotShoot,
};
