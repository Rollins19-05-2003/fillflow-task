const mongoose = require("mongoose");

// Define Warehouse Schema
const warehouseSchema = new mongoose.Schema(
  {
    warehouse_name: {
      type: String,
      required: true,
    },
    warehouse_address: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create Warehouse model
const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
