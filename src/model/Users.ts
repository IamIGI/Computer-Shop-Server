import mongoose from 'mongoose';

export interface recipientTemplate {
    name: string;
    street: string;
    zipCode: string;
    place: string;
    email: string;
    phone: number;
}

export interface UserInput {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
    Enlistments: {
        shopRules: boolean;
        email: boolean;
        sms: boolean;
        phone: boolean;
        adjustedOffers: boolean;
    };
    refreshToken: string;
    roles: {
        User: {
            type: number;
            default: 2001;
        };
        Editor: number;
        Admin: number;
    };
    userOrders: string[];
    userComments: string[];
    commentedProducts: string[];
    recipientTemplates?: recipientTemplate[];
    usedPromoCodes?: { code: string; date: string }[];
}

export interface UserDocument extends UserInput, mongoose.Document {}

const Schema = mongoose.Schema;

const recipientTemplateSchema = new Schema({
    name: String,
    street: String,
    zipCode: String,
    place: String,
    email: String,
    phone: Number,
    comment: String,
});

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    hashedPassword: String,
    Enlistments: {
        shopRules: Boolean,
        email: Boolean,
        sms: Boolean,
        phone: Boolean,
        adjustedOffers: Boolean,
    },
    refreshToken: String,
    roles: {
        User: {
            type: Number,
            default: 2001,
        },
        Editor: Number,
        Admin: Number,
    },
    userOrders: [Array],
    usedPromoCodes: [{ code: String, date: String }],
    userComments: Array,
    commentedProducts: Array,
    recipientTemplates: [
        {
            name: String,
            street: String,
            zipCode: String,
            place: String,
            email: String,
            phone: Number,
        },
    ],
});

const UserModel = mongoose.model<UserDocument>('users', userSchema);
export default UserModel;
