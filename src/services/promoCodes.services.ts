import PromoCodesModel, { PromoCodesDocument, ProductToBeDiscounted } from '../model/PromoCodes';
import format from 'date-fns/format';
import UserModel from '../model/Users';

/**add promo codes to db with expiration date given by number of days count from current date. Type must be: currency / percentage */
async function addPromoCodes(
    category: string,
    product: string,
    code: string,
    expiredIn: number,
    type?: string,
    value?: number
): Promise<void> {
    try {
        const newPromoCode = new PromoCodesModel({
            category,
            product,
            code,
            type,
            value,
            createdAt: format(new Date(), 'yyyy.MM.dd'),
            expiredIn: format(
                new Date(Date.now() + 1000 /*sec*/ * 60 /*min*/ * 60 /*hour*/ * 24 /*day*/ * expiredIn),
                'yyyy.MM.dd'
            ),
        });

        await newPromoCode.save();
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/** check if promo code exists in db */
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
async function getPromoCodeType(
    code: string
): Promise<{ category: string; type: string; value: number; product?: string }> {
    try {
        const promoCode = await PromoCodesModel.findOne({ code }).exec();

        if (!promoCode) throw { err: 'bad code', reason: 'given code do not exists in db' };

        if (promoCode.category === 'products') {
            const { category, product, type, value } = promoCode;
            return {
                category,
                product,
                type,
                value,
            };
        }
        const { category, type, value } = promoCode;
        return {
            category,
            type,
            value,
        };
    } catch (err) {
        console.log(err);
        throw err;
    }
}

/** return products for discount, erase products that already are discounted, return just products of given brand if promoCode is about given product */
async function getProductsForDiscount(
    products: ProductToBeDiscounted[],
    promoCodeType: { category: string; type: string; value: number; product?: string }
): Promise<ProductToBeDiscounted[] | []> {
    const productsWithoutDiscounts = products.filter((product) => product.isDiscount === false);

    if (productsWithoutDiscounts.length === 0) return [];

    if (promoCodeType.category === 'products') {
        if (!promoCodeType.product) throw { err: 'noProduct', reason: 'given code do not have brand to be discounted' };

        return productsWithoutDiscounts.filter(
            (product) => product.brand.toLowerCase() === promoCodeType.product!.toLowerCase()
        );
    }
    return productsWithoutDiscounts;
}

/** get the cheapest one product and change the value of  isDiscount key to true */
function getCheapestOneProduct(products: ProductToBeDiscounted[]): ProductToBeDiscounted[] {
    let productForDiscount = products[0];
    products.map((item) => {
        if (productForDiscount.price > item.price) productForDiscount = item;
    });

    if (productForDiscount.quantity > 1)
        return [
            { ...productForDiscount, quantity: 1 },
            { ...productForDiscount, quantity: productForDiscount.quantity - 1 },
        ];

    return [productForDiscount];
}
/**Type must be: currency / percentage */
function discountProduct(
    products: ProductToBeDiscounted[],
    promoCodeType: { category: string; type: string; value: number; product?: string }
): ProductToBeDiscounted[] {
    let discountedProduct = products[0];
    let discountedPrice = 0;
    switch (promoCodeType.type) {
        case 'percentage':
            discountedPrice = Number(
                (discountedProduct.price - discountedProduct.price * promoCodeType.value! * 0.01).toFixed(2)
            );
            break;
        case 'currency':
            discountedPrice = Number((discountedProduct.price - promoCodeType.value!).toFixed(2));
            break;

        default:
            throw 'Bad promoCode type';
    }

    discountedProduct = {
        ...discountedProduct,
        price: discountedPrice,
        isDiscount: true,
        priceBeforeDiscount: discountedProduct.price,
    };

    // create array with discounted Products
    products.shift();
    let discountedProducts: ProductToBeDiscounted[] = [];
    discountedProducts.push(discountedProduct);
    if (products[0] !== undefined) discountedProducts.push(products[0]);
    return discountedProducts;
}

async function isCodeAlreadyBeenUsedByUser(code: string, userId: string): Promise<boolean> {
    try {
        const user = await UserModel.findOne({ _id: userId }).exec();
        if (!user) throw { err: 'no user', message: 'need for logged user' };

        const userUsedPromoCodes = user.usedPromoCodes;

        if (userUsedPromoCodes === undefined) return false;
        if (userUsedPromoCodes.length === 0) return false;

        for (let i = 0; i < userUsedPromoCodes.length; i++) {
            if (userUsedPromoCodes[i].code === code) return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

async function assignPromoCodesToUser(userId: string, code: string): Promise<void> {
    try {
        const user = await UserModel.findOne({ _id: userId }).exec();
        if (!user) throw { err: 'no user', message: 'need for logged user' };

        const response = await UserModel.updateOne(
            { _id: userId },
            {
                $push: {
                    usedPromoCodes: { code, date: format(new Date(), 'yyyy.MM.dd-HH:mm:ss') },
                },
            }
        );

        console.log('Successfully assigned code to user');
    } catch (err) {
        throw err;
    }
}

export default {
    addPromoCodes,
    checkIfPromoCodeExists,
    filterPromoCodes,
    getPromoCodeType,
    getProductsForDiscount,
    getCheapestOneProduct,
    discountProduct,
    isCodeAlreadyBeenUsedByUser,
    assignPromoCodesToUser,
};
