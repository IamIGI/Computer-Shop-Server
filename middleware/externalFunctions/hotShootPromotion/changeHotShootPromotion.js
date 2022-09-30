const Products = require('../../../model/Products');
const getRandomInt = require('../getRandomInt');
const isChangePromotionNow = require('./isChangePromotionNow');
const noLongerBlockedProducts = require('./noLongerBlockedProducts');
const { format } = require('date-fns');
const HotShoot = require('../../../model/HotShoot');

async function changeHotShootPromotion(discountValue) {
    let productForHotShoot = '';

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

                    console.log(productForHotShoot._id);

                    //set new promotion and add item to blocked list
                    const restOfDate = format(new Date(), 'yyyy.MM.dd-H').split('-')[0];
                    const hour = parseInt(format(new Date(), 'yyyy.MM.dd-H').split('-')[1] + 1); //change is made on 9:59:58 || 21:59:58
                    const changeDate = `${restOfDate}-${hour.toString()}:00`;

                    await HotShoot.updateOne(
                        { _id: '631b62207137bd1bfd2c60aa' },
                        {
                            $set: {
                                promotion: {
                                    productData: productForHotShoot,
                                    discount: discountValue,
                                    date: changeDate,
                                    // date: '2022.09.22-22:00',
                                    isMorning,
                                },
                            },
                            $push: {
                                blocked: { productId: _id, date: changeDate },
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
        return {
            message: 'Timer Hot Shoot promotion change successfully',
            product: { id: productForHotShoot._id },
        };
    }

    return {
        message: 'Timer Hot Shoot promotion change failure',
        reason: 'It is not 10 am or 10 pm or already change was.',
    };
}

module.exports = changeHotShootPromotion;
