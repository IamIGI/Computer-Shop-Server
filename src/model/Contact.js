const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    name: String,
    email: String,
    date: String,
    message: String,
    category: Number,
    image: {
        added: Boolean,
        images: [
            {
                type: String,
            },
        ],
    },
});

module.exports = mongoose.model('contacts', contactSchema);
