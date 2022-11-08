import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const hotShootSchema = new Schema({
    promotion: { productData: Object, discount: Number, date: String, isMorning: Boolean },
    queue: [{ productId: String, discount: Number }],
    blocked: [{ productId: String, date: String }],
});

module.exports = mongoose.model('hotshoots', hotShootSchema);
