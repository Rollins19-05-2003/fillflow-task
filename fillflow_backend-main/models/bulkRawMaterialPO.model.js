const mongoose = require("mongoose");

const bulkRawMaterialPOSchema = new mongoose.Schema(
  {
    raw_material_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "RawMaterials",
    },
    quantity: {
      type: Number,
      required: true,
    },

    bulkOrderReference: {
        type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    batchData: [
      {
        batchNumber: {
          type: Number,
        },
        quantity: {
          type: Number,
        },
      },
    ],

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "fulfilled"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create B2B PO model
const bulkRawMaterialPO = mongoose.model("bulkRawMaterialPO", bulkRawMaterialPOSchema);

module.exports = bulkRawMaterialPO;
