const Products = require('../model/Products');
const HotShoot = require('../model/HotShoot');
const getRandomInt = require('../middleware/externalFunctions/getRandomInt');
const isChangePromotionNow = require('../middleware/externalFunctions/isChangePromotionNow');
const noLongerBlockedProducts = require('../middleware/externalFunctions/noLongerBlockedProducts');
const { apiErrorHandler } = require('../middleware/errorHandlers');
const { format } = require('date-fns');

const getHotShoot = async (req, res) => {
    console.log(`${req.originalUrl}`);
    let discountValue = 500;
    let productForHotShoot = '';

    try {
        const hotShoot = (await HotShoot.find({}).lean())[0];
        const products = await Products.find({}).lean();
        productForHotShoot = hotShoot.promotion;

        const { changePromotionItem, isMorning } = isChangePromotionNow(productForHotShoot);
        console.log(`ChangePromotion: ${changePromotionItem}, isMorning: ${isMorning}`);

        if (changePromotionItem) {
            //if there is no queued promotion
            if (hotShoot.queue.length === 0) {
                // check if given product was already in promotion
                let isBlocked = true;
                while (isBlocked) {
                    productForHotShoot = products[getRandomInt(products.length)];
                    const findItem = hotShoot.blocked.filter((blockedProduct) => {
                        return blockedProduct.productId.includes(productForHotShoot._id);
                    });

                    if (findItem.length === 0) {
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

                        //add item to blocked list
                        await HotShoot.updateOne(
                            { _id: '631b62207137bd1bfd2c60aa' },
                            {
                                $set: {
                                    promotion: {
                                        productData: productForHotShoot,
                                        discount: discountValue,
                                        date: `${format(new Date(), 'yyyy.MM.dd-H')}:00`,
                                        isMorning,
                                    },
                                },
                                $push: {
                                    blocked: { productId: _id, date: `${format(new Date(), 'yyyy.MM.dd-H')}:00` },
                                },
                            },
                            {
                                upsert: true,
                            }
                        );
                        isBlocked = false;
                    }
                }
            }
            // later write there else so if there is something in queue then use this item for promotion

            //remove item
            const removeItem = noLongerBlockedProducts(hotShoot.blocked, 48);
            if (removeItem.length !== 0) {
                const deleteResult = await HotShoot.updateOne(
                    { _id: '631b62207137bd1bfd2c60aa' },
                    {
                        $pull: { blocked: { productId: removeItem[0].productId } },
                    }
                );
                console.log(deleteResult);
            }
        }
        return res.status(200).json({ productForHotShoot, discount: productForHotShoot.discount });
    } catch (err) {
        console.log(err);
        apiErrorHandler(req, res, err);
    }
};

const setHotShoot = async (req, res) => {
    console.log(`${req.originalUrl}`);
    res.status(200).json({ message: 'Hot Shoot promotion', send: req.body });
};

module.exports = {
    getHotShoot,
    setHotShoot,
};
