import PromoCodesModel, { PromoCodesDocument } from '../model/PromoCodes';
import format from 'date-fns/format';

async function addPromoCodes(category: string, product: string, code: string, expiredIn: number): Promise<void> {
    try {
        const newPromoCode = new PromoCodesModel({
            category,
            product,
            code,
            createdAt: format(new Date(), 'yyyy.MM.dd'),
            expiredIn: format(
                new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * expiredIn),
                'yyyy.MM.dd'
            ),
        });

        const response = await newPromoCode.save();
        console.log(response);
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function checkIfPromoCodeExists(code: string): Promise<boolean> {
    try {
        const exists = await PromoCodesModel.findOne({ code }).exec();
        if (!exists) return false;
        return true;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function filterPromoCodes(category: string): Promise<PromoCodesDocument> {
    return await PromoCodesModel.find({ category }).lean();
}

export default { addPromoCodes, checkIfPromoCodeExists, filterPromoCodes };
