const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema
const forbiddenWordsSchema = new Schema({
    forbiddenWords: Array,
});
module.exports = mongoose.model('forbiddenwords', forbiddenWordsSchema);
