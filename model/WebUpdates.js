const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const webUpdatesSchema = new Schema({
    version: String,
    date: String,
    changes: {
        added: Array,
        fixes: Array,
    },
});

module.exports = mongoose.model('WebUpdates', webUpdatesSchema);
