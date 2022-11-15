import mongoose from 'mongoose';

export interface ContactInput {
    name: string;
    email: string;
    date: string;
    message: string;
    category: number;
    image: {
        added: boolean;
        images: [
            {
                type: string;
            }
        ];
    };
}

export interface ContactDocument extends ContactInput, mongoose.Document {}

const Schema = mongoose.Schema;

const contactSchema = new Schema({
    name: String,
    email: String,
    date: String,
    message: String,
    category: Number,
    image: {
        added: Boolean,
        images: [
            {
                type: String,
            },
        ],
    },
});

export default mongoose.model<ContactDocument>('contacts', contactSchema);
