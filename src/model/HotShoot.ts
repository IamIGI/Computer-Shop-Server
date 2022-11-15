import mongoose from 'mongoose';
import { ProductDocument } from '../model/Products';

export interface hotShootPromotion {
    productData: ProductDocument;
    discount: number;
    date: string;
    isMorning: boolean;
}

export interface hotShootBlocked {
    productId: string;
    date: string;
}

export interface hotShootInput {
    promotion: hotShootPromotion;
    queue: [{ productId: string; discount: number }];
    blocked: hotShootBlocked[];
}

export interface hotShootDocument extends hotShootInput, mongoose.Document {}

const Schema = mongoose.Schema;

const hotShootSchema = new Schema({
    promotion: { productData: Object, discount: Number, date: String, isMorning: Boolean },
    queue: [{ productId: String, discount: Number }],
    blocked: [{ productId: String, date: String }],
});

const HotShootModel = mongoose.model<hotShootDocument>('hotshoots', hotShootSchema);

export default HotShootModel;
