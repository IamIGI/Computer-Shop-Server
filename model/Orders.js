const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        },
    },
});

module.exports = mongoose.model('Orders', orderSchema);
