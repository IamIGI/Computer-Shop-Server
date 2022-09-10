const getDateDiffInHours = require('./getDateDiffInHours');
const { format } = require('date-fns');

function noLongerBlockedProducts(blockedList, hoursBlocked) {
    const currentDate = format(new Date(), 'yyyy.MM.dd-H:m');
    const removeItem = blockedList.filter((blockedProduct) => {
        if (getDateDiffInHours(new Date(blockedProduct.date), new Date(currentDate)) >= hoursBlocked) {
            return blockedProduct;
        }
    });
    return removeItem;
}

module.exports = noLongerBlockedProducts;
