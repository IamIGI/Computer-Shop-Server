const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userEnlistmentsSchema = new Schema({
    shopRules: Boolean,
    email: Boolean,
    sms: Boolean,
    phone: Boolean,
    adjustedOffers: Boolean,
});

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    hashedPassword: String,
    Enlistments: {
        type: userEnlistmentsSchema,
    },
    refreshToken: String,
});

module.exports = mongoose.model('users', userSchema);
