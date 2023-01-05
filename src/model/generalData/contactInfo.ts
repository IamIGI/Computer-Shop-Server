import mongoose, { Schema } from 'mongoose';

export interface ContactInfoInput {
    name: string;
    data: {
        telephone: string;
        openTime: {
            normal: string;
            weekend: string;
        };
        email: string;
    };
}

export interface ContactInfoDocument extends ContactInfoInput, mongoose.Document {}

const contactInfoSchema = new Schema({
    name: String,
    data: {
        telephone: String,
        openTime: {
            normal: String,
            weekend: String,
        },
        email: String,
    },
});

export const ContactInfoModel = mongoose.model<ContactInfoDocument>('contactinfos', contactInfoSchema);
