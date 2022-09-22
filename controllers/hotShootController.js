const Products = require('../model/Products');
const HotShoot = require('../model/HotShoot');
const getRandomInt = require('../middleware/externalFunctions/getRandomInt');
const isChangePromotionNow = require('../middleware/externalFunctions/isChangePromotionNow');
const noLongerBlockedProducts = require('../middleware/externalFunctions/noLongerBlockedProducts');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

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
    //Dev logs for testing in production zone.
    let discountValue = 600;
    let productForHotShoot = '';

    try {
        const hotShoot = (await HotShoot.find({}).lean())[0];
        const products = await Products.find({}).lean();
        productForHotShoot = hotShoot.promotion;

        const { changePromotionItem, isMorning } = isChangePromotionNow(productForHotShoot);
        console.log(`ChangePromotion: ${changePromotionItem}, isMorning: ${isMorning}`);

        if (changePromotionItem) {
            // if (true) {
            //remove old promotion from Product collection
            await Products.updateOne(
                { _id: productForHotShoot.productData._id },
                {
                    $set: {
                        special_offer: {
                            mode: false,
                            price: 0,
                        },
                    },
                },
                { new: true }
            ).exec();

            //if there is no queued promotion
            if (hotShoot.queue.length === 0) {
                // if (true) {
                // check if given product was already in promotion
                let isBlocked = true;
                while (isBlocked) {
                    productForHotShoot = products[getRandomInt(products.length)];
                    const findItem = hotShoot.blocked.filter((blockedProduct) => {
                        return blockedProduct.productId.includes(productForHotShoot._id);
                    });
                    console.log(`Item is blocked?:  ${findItem.length} 0 - no`);

                    //if blocked do not contain chosen item
                    if (findItem.length === 0) {
                        // if (false) {
                        isBlocked = false;
                        console.log(productForHotShoot._id);
                        const _id = productForHotShoot._id;
                        //update product data
                        productForHotShoot = await Products.findOneAndUpdate(
                            { _id },
                            {
                                special_offer: {
                                    mode: true,
                                    price: discountValue,
                                },
                            },
                            { new: true }
                        ).exec();
                        console.log('FindAndUpdate return:');
                        console.log(productForHotShoot._id);
                        console.log('-----------------');

                        //set new promotion and add item to blocked list
                        await HotShoot.updateOne(
                            { _id: '631b62207137bd1bfd2c60aa' },
                            {
                                $set: {
                                    promotion: {
                                        productData: productForHotShoot,
                                        discount: discountValue,
                                        date: `${format(new Date(), 'yyyy.MM.dd-H')}:00`,
                                        // date: '2022.09.22-22:00',
                                        isMorning,
                                    },
                                },
                                $push: {
                                    blocked: { productId: _id, date: `${format(new Date(), 'yyyy.MM.dd-H')}:00` },
                                    // blocked: { productId: _id, date: '2022.09.22-22:00' },
                                },
                            },
                            {
                                upsert: true,
                            }
                        );
                    }
                }
            }
            // later write there "else" so if there is something in queue then use this item for promotion

            //remove item from blocked list if 47 hours time block pass
            const removeItemFromBlockedList = noLongerBlockedProducts(hotShoot.blocked, 47);
            console.log('Item to be removed from blocked list');
            console.log(removeItemFromBlockedList);
            if (removeItemFromBlockedList.length !== 0) {
                // if (false) {
                //update blocked list
                const blockedListUpdate = await HotShoot.updateOne(
                    { _id: '631b62207137bd1bfd2c60aa' },
                    {
                        $pull: { blocked: { productId: removeItemFromBlockedList[0].productId } },
                    }
                );
                console.log(blockedListUpdate);
            }
            return res.status(200).json({
                message: 'Timer Hot Shoot promotion change successfully',
                product: { id: productForHotShoot._id },
            });
        }

        return res.status(200).json({
            message: 'Timer Hot Shoot promotion change failure',
            reason: 'It is not 10 am or 10 pm.',
        });
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
    getHotShoot,
    setHotShoot,
    changeHotShootTimer,
};
