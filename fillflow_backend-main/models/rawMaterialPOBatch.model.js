const mongoose = require('mongoose');

const rawMaterialPOBatchSchema = new mongoose.Schema(
  {
    po_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterialPurchaseOrders',
    },
    raw_material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterials',
      required: true,
    },
    batch_number: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const RawMaterialPOBatch = mongoose.model(
  'RawMaterialPOBatchModel',
  rawMaterialPOBatchSchema
);
module.exports = RawMaterialPOBatch;
