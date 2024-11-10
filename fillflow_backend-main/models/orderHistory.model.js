const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderHistorySchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  changes: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);

module.exports = OrderHistory;