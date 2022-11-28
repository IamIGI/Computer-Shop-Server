import { secondsInHour } from 'date-fns';
import mongoose from 'mongoose';

export interface PromoInput {
    general?: string[];
    category?: {
        delivery?: string[];
        products?: {
            dell?: string[];
            msi?: string[];
            hp?: string[];
            asus?: string[];
            apple?: string[];
            microsoft?: string[];
            general?: string[];
        };
    };
    allCodes: string[];
}

export interface PromoCodesDocument extends PromoInput, mongoose.Document {}

const Schema = mongoose.Schema;

const promoCodesSchema = new Schema({
    general: [String],
    category: {
        delivery: [String],
        products: {
            dell: [String],
            msi: [String],
            hp: [String],
            asus: [String],
            apple: [String],
            microsoft: [String],
            general: [String],
        },
    },
    allCodes: [String],
});

const PromoCodesModel = mongoose.model<PromoCodesDocument>('promocodes', promoCodesSchema);

export default PromoCodesModel;
