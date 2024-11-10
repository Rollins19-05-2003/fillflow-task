const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the product history schema
const productHistorySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  changes: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create the ProductHistory model
const ProductHistory = mongoose.model('ProductHistory', productHistorySchema);

module.exports = ProductHistory;