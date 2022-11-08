import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Schema
const contents = new Schema({
    pageName: String,
    description: Array,
    lastUpdate: String,
});
module.exports = mongoose.model('Contents', contents);
