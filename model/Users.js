const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
});

module.exports = mongoose.model('users', userSchema);
