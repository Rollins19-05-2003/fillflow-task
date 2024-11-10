const mongoose = require('mongoose');
const { Schema } = mongoose;

const rawMaterialOrderHistorySchema = new Schema({
  rawMaterial: { type: Schema.Types.ObjectId, ref: 'RawMaterials', required: true },
  changes: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RawMaterialOrderHistory = mongoose.model('RawMaterialHistory', rawMaterialOrderHistorySchema);

module.exports = RawMaterialOrderHistory;
