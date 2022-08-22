const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    productId: String,
    userId: String,
    userName: String,
    date: String,
    confirmed: Boolean,
    likes: {
        up: Number,
        down: Number,
    },
    content: {
        rating: Number,
        description: String,
    },
});

module.exports = mongoose.model('comments', commentSchema);
