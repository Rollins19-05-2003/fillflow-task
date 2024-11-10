const mongoose = require("mongoose");

const inventoryPOSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    barCodes: {
      type: [String],
    },

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

// Create RawMaterials model
const InventoryPO = mongoose.model("InventoryPO", inventoryPOSchema);

module.exports = InventoryPO;
