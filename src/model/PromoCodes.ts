import { secondsInHour } from 'date-fns';
import mongoose from 'mongoose';

export interface PromoInput {
    category: string;
    product?: string;
    code: string;
    createdAt: string;
    expiredIn: string;
}

export interface PromoCodesDocument extends PromoInput, mongoose.Document {}

const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    category: String,
    product: String,
    code: String,
    createdAt: String,
    expiredIn: String,
});

const PromoCodesModel = mongoose.model<PromoCodesDocument>('promocodes', promoCodesSchema);

export default PromoCodesModel;
