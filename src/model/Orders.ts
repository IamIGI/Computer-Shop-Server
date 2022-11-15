import mongoose from 'mongoose';

export interface OrderInput {
    status: number;
    products: [
        {
            _id: string;
            name: string;
            prevImg: string;
            price: number;
            priceBeforeDiscount: number;
            isDiscount: boolean;
            code: number;
            quantity: number;
        }
    ];
    transactionInfo: {
        date: string;
        deliveryMethod: string;
        paymentMethod: string;
        price: number;
        recipientDetails: {
            name: string;
            street: string;
            zipCode: string;
            place: string;
            email: string;
            phone: number;
            comment: string;
        };
    };
}

export interface OrderDocument extends OrderInput, mongoose.Document {}

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    status: Number,
    products: [
        {
            name: String,
            prevImg: String,
            price: Number,
            priceBeforeDiscount: Number,
            isDiscount: Boolean,
            code: Number,
            quantity: Number,
        },
    ],
    transactionInfo: {
        date: String,
        deliveryMethod: String,
        paymentMethod: String,
        price: Number,
        recipientDetails: {
            name: String,
            street: String,
            zipCode: String,
            place: String,
            email: String,
            phone: Number,
            comment: String,
        },
    },
});

export default mongoose.model<OrderDocument>('Orders', orderSchema);
