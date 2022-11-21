"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = __importDefault(require("date-fns/format"));
function isChangePromotionNow(productForHotShoot) {
    let changePromotionItem = false;
    let isMorning = false;
    //check 12 hours interval
    //currentTime
    const currentFormatDate = (0, format_1.default)(new Date(), 'yyyy.MM.dd-H:m');
    const currentDate = currentFormatDate.split('-')[0];
    const currentTime = currentFormatDate.split('-')[1];
    const currentHour = parseInt(currentTime.split(':')[0]);
    //promotionTime
    const promotionDate = productForHotShoot.date.split('-')[0];
    const promotionTime = productForHotShoot.date.split('-')[1];
    const promotionHour = parseInt(promotionTime.split(':')[0]);
    const hourDiff = promotionHour - currentHour;
    //if 10 - 22 = -12
    //if 22 - 10 =
    console.log(hourDiff);
    if (productForHotShoot.isMorning) {
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
exports.default = isChangePromotionNow;
