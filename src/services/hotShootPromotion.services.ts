import ProductModel, { ProductDocument } from '../model/Products';
import getRandomInt from '../middleware/externalFunctions/getRandomInt';
import format from 'date-fns/format';
import HotShootModel from '../model/HotShoot';
import { hotShootPromotion, hotShootBlocked } from '../model/HotShoot';
import getDateDiffInHours from '../middleware/externalFunctions/getDateDiffInHours';

function isChangePromotionNow(productForHotShoot: hotShootPromotion) {
    let changePromotionItem = false;
    let isMorning = false;
    //check 12 hours interval
    //currentTime
    const currentFormatDate = format(new Date(), 'yyyy.MM.dd-H:m');
    // const currentFormatDate = '2022.12.02-21:59';
    const currentDate = currentFormatDate.split('-')[0];
    const currentTime = currentFormatDate.split('-')[1];
    const currentHour = parseInt(currentTime.split(':')[0]);

    //promotionTime
    const promotionDate = productForHotShoot.date.split('-')[0];
    const promotionTime = productForHotShoot.date.split('-')[1];
    const promotionHour = parseInt(promotionTime.split(':')[0]);
    const hourDiff = promotionHour - currentHour; //22 - 9 = 13 | 10 - 21 = -11
    console.log(hourDiff);

    if (productForHotShoot.isMorning) {
        console.log(' isChangePromotionNow.ts ->  isMorning: ' + productForHotShoot.isMorning);
        console.log(
            'isChangePromotionNow.ts ->  Check date: ' + currentDate !== promotionDate,
            +' isChangePromotionNow.ts ->  Check hours: ' + hourDiff === 13
        );
        if (currentDate !== promotionDate && hourDiff === 13) {
            changePromotionItem = true;
            isMorning = false;
            console.log('set 10am promotion');
            return { changePromotionItem, isMorning };
        }
    } else {
        if (currentDate === promotionDate && hourDiff === -11) {
            changePromotionItem = true;
            isMorning = true;
            console.log('set 10pm promotion');
            return { changePromotionItem, isMorning };
        }
    }

    return { changePromotionItem, isMorning };
}

function noLongerBlockedProducts(blockedList: hotShootBlocked[], hoursBlocked: number) {
    const currentDate = format(new Date(), 'yyyy.MM.dd-H:m');
    console.log('noLongerBlockedProducts.ts -> currentDate: ' + currentDate);
    // const currentDate = '2022.12.02-21:59';
    const removeItem = blockedList.filter((blockedProduct) => {
        if (getDateDiffInHours(new Date(blockedProduct.date), new Date(currentDate)) >= hoursBlocked) {
            return blockedProduct;
        }
    });
    return removeItem;
}

/** discount product by given percentage value. 0 - 60% */
function discountProduct(percentage: number, product: ProductDocument): number {
    const productDefaultPrice = product.price;
    if (percentage < 1 || percentage > 60) {
        console.log({
            message: 'percentage value must be between 1-60% Returned default price',
            percentageValue: percentage,
        });
        return productDefaultPrice;
    }

    const promoPrice = Number((productDefaultPrice - productDefaultPrice * percentage * 0.01).toFixed(2));
    return promoPrice;
}

/** discount product by given percentage. Function unblock products after 48 hours and change promotion if 12 h passed 10 am 10 pm. Discount mu be between 1 - 60% */
async function changeHotShootPromotion(discountValue: number) {
    const hotShoot = (await HotShootModel.find({}).lean())[0];
    const products = await ProductModel.find({}).lean();
    let currentProductForHotShoot = hotShoot.promotion;

    const { changePromotionItem, isMorning } = isChangePromotionNow(currentProductForHotShoot);
    console.log(`ChangePromotion: ${changePromotionItem}, isMorning: ${isMorning}`);

    if (changePromotionItem) {
        //remove old promotion from Product collection
        const response1 = await ProductModel.updateOne(
            { _id: currentProductForHotShoot.productData._id },
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
        console.log(' ChangeHotShootPromotion.ts -> Remove old promotion DB update: ');
        console.log(response1);
        //if there is no queued promotion
        let productForHotShoot: ProductDocument;
        if (hotShoot.queue.length === 0) {
            // check if given product was already in promotion
            let isBlocked = true;

            while (isBlocked) {
                productForHotShoot = products[getRandomInt(products.length)];
                const findItem = hotShoot.blocked.filter((blockedProduct) => {
                    return blockedProduct.productId.includes(productForHotShoot._id);
                });

                //if blocked do not contain chosen item
                if (findItem.length === 0) {
                    isBlocked = false;
                    //----------percentage Update, fix discountValue update
                    //Update product object;
                    productForHotShoot.special_offer.mode = true;
                    productForHotShoot.special_offer.price = discountValue;
                    discountValue = discountProduct(discountValue, productForHotShoot);
                    //-------
                    console.log(' ChangeHotShootPromotion.ts -> New promotion: ' + productForHotShoot._id);
                    const _id = productForHotShoot._id;
                    //update product data
                    const response2 = await ProductModel.findOneAndUpdate(
                        { _id },
                        {
                            special_offer: {
                                mode: true,
                                price: discountValue,
                            },
                        },
                        { new: true }
                    ).exec();

                    console.log(' ChangeHotShootPromotion.ts -> update new product hotShootPromotion');
                    console.log(response2);
                    //set new promotion and add item to blocked list
                    const restOfDate = format(new Date(), 'yyyy.MM.dd-H').split('-')[0];
                    const hour = parseInt(format(new Date(), 'yyyy.MM.dd-H').split('-')[1]) + 1;
                    const changeDate = `${restOfDate}-${hour.toString()}:00`;

                    const response3 = await HotShootModel.updateOne(
                        { _id: '631b62207137bd1bfd2c60aa' },
                        {
                            $set: {
                                promotion: {
                                    productData: productForHotShoot,
                                    discount: discountValue,
                                    date: changeDate,
                                    isMorning,
                                },
                            },
                            $push: {
                                blocked: { productId: _id, date: changeDate },
                            },
                        },
                        {
                            upsert: true,
                        }
                    );

                    console.log(' ChangeHotShootPromotion.ts -> Update product in db and add it to blocked list');
                    console.log(response3);
                }
            }
        }
        // later write there "else" so if there is something in queue then use this item for promotion

        //remove item from blocked list if 47 hours time block pass
        const removeItemFromBlockedList = noLongerBlockedProducts(hotShoot.blocked, 47);
        console.log(' ChangeHotShootPromotion.ts -> Item for unblock: ' + removeItemFromBlockedList);
        if (removeItemFromBlockedList.length !== 0) {
            //update blocked list
            const blockedListUpdate = await HotShootModel.updateOne(
                { _id: '631b62207137bd1bfd2c60aa' },
                {
                    $pull: { blocked: { productId: removeItemFromBlockedList[0].productId } },
                }
            );
            console.log(' ChangeHotShootPromotion.ts -> Remove no longer blocked element');
            console.log(blockedListUpdate);
        }
        return {
            message: 'Timer Hot Shoot promotion change successfully',
            product: { id: productForHotShoot!._id },
        };
    }

    return {
        message: 'Timer Hot Shoot promotion change failure',
        reason: 'It is not 10 am or 10 pm ',
    };
}

export default { changeHotShootPromotion, discountProduct };
