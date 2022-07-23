const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipientDetailsSchema = new Schema({
    name: String,
    street: String,
    zipCode: String,
    place: String,
    email: String,
    phone: Number,
});

const transactionInfoSchema = new Schema({
    deliveryMethod: String,
    paymentMethod: String,
    price: Number,
    recipientDetails: {
        type: recipientDetailsSchema,
    },
});

const orderSchema = new Schema({
    orderCode: String,
    products: [
        {
            name: String,
            prevImg: String,
            price: Number,
            code: Number,
        },
    ],
    transactionInfo: {
        type: transactionInfoSchema,
    },
});

module.exports = mongoose.model('Orders', orderSchema);
