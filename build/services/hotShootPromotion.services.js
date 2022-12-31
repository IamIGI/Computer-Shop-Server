"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Products_1 = __importDefault(require("../model/Products"));
const getRandomInt_1 = __importDefault(require("../middleware/externalFunctions/getRandomInt"));
const format_1 = __importDefault(require("date-fns/format"));
const HotShoot_1 = __importDefault(require("../model/HotShoot"));
const getDateDiffInHours_1 = __importDefault(require("../middleware/externalFunctions/getDateDiffInHours"));
function isChangePromotionNow(productForHotShoot) {
    let changePromotionItem = false;
    let isMorning = false;
    //check 12 hours interval
    //currentTime
    const currentFormatDate = (0, format_1.default)(new Date(), 'yyyy.MM.dd-H:m');
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
        console.log('isChangePromotionNow.ts ->  Check date: ' + currentDate !== promotionDate, +' isChangePromotionNow.ts ->  Check hours: ' + hourDiff === 13);
        if (currentDate !== promotionDate && hourDiff === 13) {
            changePromotionItem = true;
            isMorning = false;
            console.log('set 10am promotion');
            return { changePromotionItem, isMorning };
        }
    }
    else {
        if (currentDate === promotionDate && hourDiff === -11) {
            changePromotionItem = true;
            isMorning = true;
            console.log('set 10pm promotion');
            return { changePromotionItem, isMorning };
        }
    }
    return { changePromotionItem, isMorning };
}
function noLongerBlockedProducts(blockedList, hoursBlocked) {
    const currentDate = (0, format_1.default)(new Date(), 'yyyy.MM.dd-H:m');
    console.log('noLongerBlockedProducts.ts -> currentDate: ' + currentDate);
    // const currentDate = '2022.12.02-21:59';
    const removeItem = blockedList.filter((blockedProduct) => {
        if ((0, getDateDiffInHours_1.default)(new Date(blockedProduct.date), new Date(currentDate)) >= hoursBlocked) {
            return blockedProduct;
        }
    });
    return removeItem;
}
/** discount product by given percentage value. 0 - 60% */
function discountProduct(percentage, product) {
    const productDefaultPrice = product.price;
    if (percentage < 1 || percentage > 60) {
        console.log({
            message: 'percentage value must be between 1-60% Returned default price',
            percentageValue: percentage,
        });
        return productDefaultPrice;
    }
    const promoPrice = Number((productDefaultPrice * percentage * 0.01).toFixed(2));
    return promoPrice;
}
/** discount product by given percentage. Function unblock products after 48 hours and change promotion if 12h passed 10 am 10 pm. Discount must be between 1 - 60% */
function changeHotShootPromotion(discountValue) {
    return __awaiter(this, void 0, void 0, function* () {
        const hotShoot = (yield HotShoot_1.default.find({}).lean())[0];
        const products = yield Products_1.default.find({}).lean();
        let currentProductForHotShoot = hotShoot.promotion;
        const { changePromotionItem, isMorning } = isChangePromotionNow(currentProductForHotShoot);
        console.log(`ChangePromotion: ${changePromotionItem}, isMorning: ${isMorning}`);
        if (changePromotionItem) {
            //remove old promotion from Product collection
            const response1 = yield Products_1.default.updateOne({ _id: currentProductForHotShoot.productData._id }, {
                $set: {
                    special_offer: {
                        mode: false,
                        price: 0,
                    },
                },
            }, { new: true }).exec();
            console.log(' ChangeHotShootPromotion.ts -> Remove old promotion DB update: ');
            console.log(response1);
            //if there is no queued promotion
            let productForHotShoot;
            if (hotShoot.queue.length === 0) {
                // check if given product was already in promotion
                let isBlocked = true;
                while (isBlocked) {
                    productForHotShoot = products[(0, getRandomInt_1.default)(products.length)];
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
                        const response2 = yield Products_1.default.findOneAndUpdate({ _id }, {
                            special_offer: {
                                mode: true,
                                price: discountValue,
                            },
                        }, { new: true }).exec();
                        console.log(' ChangeHotShootPromotion.ts -> update new product hotShootPromotion');
                        console.log(response2);
                        //set new promotion and add item to blocked list
                        const restOfDate = (0, format_1.default)(new Date(), 'yyyy.MM.dd-H').split('-')[0];
                        const hour = parseInt((0, format_1.default)(new Date(), 'yyyy.MM.dd-H').split('-')[1]) + 1;
                        const changeDate = `${restOfDate}-${hour.toString()}:00`;
                        const response3 = yield HotShoot_1.default.updateOne({ _id: '631b62207137bd1bfd2c60aa' }, {
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
                        }, {
                            upsert: true,
                        });
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
                const blockedListUpdate = yield HotShoot_1.default.updateOne({ _id: '631b62207137bd1bfd2c60aa' }, {
                    $pull: { blocked: { productId: removeItemFromBlockedList[0].productId } },
                });
                console.log(' ChangeHotShootPromotion.ts -> Remove no longer blocked element');
                console.log(blockedListUpdate);
            }
            return {
                message: 'Timer Hot Shoot promotion change successfully',
                product: { id: productForHotShoot._id },
            };
        }
        return {
            message: 'Timer Hot Shoot promotion change failure',
            reason: 'It is not 10 am or 10 pm ',
        };
    });
}
exports.default = { changeHotShootPromotion, discountProduct };
