const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema
const productSchema = new Schema({
    code: { type: Number },
});
module.exports = mongoose.model('Products', productSchema);
