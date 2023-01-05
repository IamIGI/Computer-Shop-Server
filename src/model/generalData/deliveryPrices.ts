import mongoose, { Schema } from 'mongoose';

export interface DeliveryPricesInput {
    name: string;
    data: {
        deliveryMan: number;
        atTheSalon: number;
        locker: number;
    };
}

export interface DeliveryPricesDocument extends DeliveryPricesInput, mongoose.Document {}

const deliveryPricesSchema = new Schema({
    name: String,
    data: {
        deliveryMan: Number,
        atTheSalon: Number,
        locker: Number,
    },
});

export const DeliveryPricesModel = mongoose.model<DeliveryPricesDocument>('deliveryprices', deliveryPricesSchema);
