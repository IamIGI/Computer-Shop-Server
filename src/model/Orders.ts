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
            phone: string;
            comment: string;
        };
    };
    usedPromoCode: { isUsed: boolean; code?: string };
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
            phone: String,
            comment: String,
        },
    },
    usedPromoCode: String,
});

const OrderModel = mongoose.model<OrderDocument>('Orders', orderSchema);

export default OrderModel;
