import mongoose from 'mongoose';

export interface ProductToBeDiscounted {
    isDiscount: boolean;
    name: string;
    brand: string;
    prevImg: string;
    price: number;
    priceBeforeDiscount: number;
    quantity: number;
    _id: string;
}

export interface PromoInput {
    category: string;
    product?: string;
    code: string;
    type?: string;
    value?: number;
    createdAt: string;
    expiredIn: string;
}

export interface PromoCodesDocument extends PromoInput, mongoose.Document {}

const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    category: String,
    product: String,
    code: String,
    type: String,
    value: Number,
    createdAt: String,
    expiredIn: String,
});

const PromoCodesModel = mongoose.model<PromoCodesDocument>('promocodes', promoCodesSchema);

export default PromoCodesModel;
