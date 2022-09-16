const { format } = require('date-fns');

function isChangePromotionNow(productForHotShoot) {
    let changePromotionItem = false;
    let isMorning = false;
    //check 12 hours interval
    //currentTime
    const currentFormatDate = format(new Date(), 'yyyy.MM.dd-H:m');
    const currentDate = currentFormatDate.split('-')[0];
    const currentTime = currentFormatDate.split('-')[1];
    const currentHour = parseInt(currentTime.split(':')[0]);

    //promotionTime
    const promotionDate = productForHotShoot.date.split('-')[0];
    const promotionTime = productForHotShoot.date.split('-')[1];
    const promotionHour = parseInt(promotionTime.split(':')[0]);
    const hourDiff = promotionHour - currentHour;

    if (productForHotShoot.isMorning) {
        if (currentDate !== promotionDate && hourDiff === 12) {
            changePromotionItem = true;
            isMorning = false;
            console.log('10am promotion');
            return { changePromotionItem, isMorning };
        }
    } else {
        if (currentDate === promotionDate && hourDiff === -12) {
            changePromotionItem = true;
            isMorning = true;
            console.log('10pm promotion');
            return { changePromotionItem, isMorning };
        }
    }
    changePromotionItem = false;
    isMorning = false;
    return { changePromotionItem, isMorning };
}

module.exports = isChangePromotionNow;
