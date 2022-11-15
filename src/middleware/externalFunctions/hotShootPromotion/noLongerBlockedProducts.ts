import getDateDiffInHours from '../getDateDiffInHours';
import { format } from 'date-fns';
import { hotShootBlocked } from '../../../model/HotShoot';

function noLongerBlockedProducts(blockedList: hotShootBlocked[], hoursBlocked: number) {
    const currentDate = format(new Date(), 'yyyy.MM.dd-H:m');
    const removeItem = blockedList.filter((blockedProduct) => {
        if (getDateDiffInHours(new Date(blockedProduct.date), new Date(currentDate)) >= hoursBlocked) {
            return blockedProduct;
        }
    });
    return removeItem;
}

export default noLongerBlockedProducts;
