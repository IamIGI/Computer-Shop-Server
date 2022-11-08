const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema
const productSchema = new Schema({
    special_offer: {
        mode: Boolean,
        price: Number,
    },
});
module.exports = mongoose.model('Products', productSchema);
