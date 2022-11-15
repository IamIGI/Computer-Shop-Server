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
const Products_1 = __importDefault(require("../../../model/Products"));
const getRandomInt_1 = __importDefault(require("../getRandomInt"));
const isChangePromotionNow_1 = __importDefault(require("./isChangePromotionNow"));
const noLongerBlockedProducts_1 = __importDefault(require("./noLongerBlockedProducts"));
const date_fns_1 = require("date-fns");
const HotShoot_1 = __importDefault(require("../../../model/HotShoot"));
function changeHotShootPromotion(discountValue) {
    return __awaiter(this, void 0, void 0, function* () {
        let productForHotShoot = '';
        const hotShoot = (yield HotShoot_1.default.find({}).lean())[0];
        const products = yield Products_1.default.find({}).lean();
        productForHotShoot = hotShoot.promotion;
        const { changePromotionItem, isMorning } = (0, isChangePromotionNow_1.default)(productForHotShoot);
        console.log(`ChangePromotion: ${changePromotionItem}, isMorning: ${isMorning}`);
        if (changePromotionItem) {
            // if (true) {
            //remove old promotion from Product collection
            yield Products_1.default.updateOne({ _id: productForHotShoot.productData._id }, {
                $set: {
                    special_offer: {
                        mode: false,
                        price: 0,
                    },
                },
            }, { new: true }).exec();
            //if there is no queued promotion
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
                        console.log(productForHotShoot._id);
                        const _id = productForHotShoot._id;
                        //update product data
                        productForHotShoot = yield Products_1.default.findOneAndUpdate({ _id }, {
                            special_offer: {
                                mode: true,
                                price: discountValue,
                            },
                        }, { new: true }).exec();
                        console.log(productForHotShoot._id);
                        //set new promotion and add item to blocked list
                        const restOfDate = (0, date_fns_1.format)(new Date(), 'yyyy.MM.dd-H').split('-')[0];
                        const hour = parseInt((0, date_fns_1.format)(new Date(), 'yyyy.MM.dd-H').split('-')[1]) + 1; //change is made on 9:59:58 || 21:59:58
                        const changeDate = `${restOfDate}-${hour.toString()}:00`;
                        yield HotShoot_1.default.updateOne({ _id: '631b62207137bd1bfd2c60aa' }, {
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
                    }
                }
            }
            // later write there "else" so if there is something in queue then use this item for promotion
            //remove item from blocked list if 47 hours time block pass
            const removeItemFromBlockedList = (0, noLongerBlockedProducts_1.default)(hotShoot.blocked, 47);
            console.log('Item to be removed from blocked list');
            console.log(removeItemFromBlockedList);
            if (removeItemFromBlockedList.length !== 0) {
                //update blocked list
                const blockedListUpdate = yield HotShoot_1.default.updateOne({ _id: '631b62207137bd1bfd2c60aa' }, {
                    $pull: { blocked: { productId: removeItemFromBlockedList[0].productId } },
                });
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
    });
}
exports.default = changeHotShootPromotion;
