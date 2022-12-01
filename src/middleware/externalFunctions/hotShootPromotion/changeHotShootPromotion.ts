import ProductModel, { ProductDocument } from '../../../model/Products';
import getRandomInt from '../getRandomInt';
import isChangePromotionNow from './isChangePromotionNow';
import noLongerBlockedProducts from './noLongerBlockedProducts';
import format from 'date-fns/format';
import HotShootModel from '../../../model/HotShoot';

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
                    // const restOfDate = '2022.12.02-21:59'.split('-')[0];
                    const hour = parseInt(format(new Date(), 'yyyy.MM.dd-H').split('-')[1]) + 1; //change is made on 9:59:58 || 21:59:58
                    // const hour = parseInt('2022.12.02-21:59'.split('-')[1]) + 1; //change is made on 9:59:58 || 21:59:58
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
            product: { id: productForHotShoot!._id }, //for now use ! ts param, cuz I we do not implement admin functionality to que up the hotShoot promotion
        };
    }

    return {
        message: 'Timer Hot Shoot promotion change failure',
        reason: 'It is not 10 am or 10 pm ',
    };
}

export default changeHotShootPromotion;
