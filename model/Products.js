const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema
const productSchema = new Schema({});
module.exports = mongoose.model('Products', productSchema);
