import PromoCodesModel, { PromoCodesDocument, ProductToBeDiscounted } from '../model/PromoCodes';
import format from 'date-fns/format';
import { array } from 'zod';
/**add promo codes to db with expiration date given by number of days count from current date */
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

/** filter promoCodes by given category: delivery, products, general */
async function filterPromoCodes(category: string): Promise<PromoCodesDocument> {
    if ((category = 'none')) return await PromoCodesModel.find({}).lean();
    return await PromoCodesModel.find({ category }).lean();
}

/** get  the promoCode type*/
async function getPromoCodeType(code: string): Promise<{ category: string; product?: string }> {
    try {
        const promoCode = await PromoCodesModel.findOne({ code }).exec();

        if (!promoCode) throw { err: 'bad code', reason: 'given code do not exists in db' };

        if (promoCode.category === 'products') return { category: promoCode.category, product: promoCode.product };
        return { category: promoCode.category };
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/** return products for discount, erase products that already are discounted, return just products of given brand if promoCode is about given product */
async function getProductsForDiscount(
    products: ProductToBeDiscounted[],
    promoCodeType: { category: string; product?: string }
): Promise<ProductToBeDiscounted[] | []> {
    const productsWithoutDiscounts = products.filter((product) => product.isDiscount === false);

    if (productsWithoutDiscounts.length === 0) return [];

    if (promoCodeType.category === 'products') {
        if (!promoCodeType.product) throw { err: 'noProduct', reason: 'given code do not have brand to be discounted' };

        console.log(productsWithoutDiscounts);
        return productsWithoutDiscounts.filter(
            (product) => product.brand.toLowerCase() === promoCodeType.product!.toLowerCase()
        );
    }
    return productsWithoutDiscounts;
}

function getCheapestOneProduct(products: ProductToBeDiscounted[]): ProductToBeDiscounted[] {
    let productForDiscount = products[0];
    products.map((item) => {
        if (productForDiscount.price > item.price) productForDiscount = item;
    });

    productForDiscount = { ...productForDiscount, isDiscount: true };

    if (productForDiscount.quantity > 1)
        return [
            { ...productForDiscount, quantity: 1 },
            { ...productForDiscount, quantity: productForDiscount.quantity - 1 },
        ];

    return [productForDiscount];
}

export default {
    addPromoCodes,
    checkIfPromoCodeExists,
    filterPromoCodes,
    getPromoCodeType,
    getProductsForDiscount,
    getCheapestOneProduct,
};
