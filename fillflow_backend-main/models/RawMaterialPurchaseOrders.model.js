const mongoose = require("mongoose");

const rawMaterialPurchaseOrdersSchema = new mongoose.Schema(
  {
    grn_number: {
      type: String,
    },
    po_number: {
      type: String,
      required: true,
    },
    bill_number: {
      type: String,
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    warehouse_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    raw_material_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RawMaterials",
    },
    order_date_time: {
      type: Date,
      default: Date.now,
    },

    qcData: {
      passedQcInfo: {
        type: Number,
      },
      failedQcInfo: {
        type: Number,
      },
      comment: {
        type: String,
      },
    },

    quantity: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending","qc_info_added", "fulfilled"],
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

const RawMaterialPurchaseOrders = mongoose.model(
  "RawMaterialPurchaseOrders",
  rawMaterialPurchaseOrdersSchema
);

module.exports = RawMaterialPurchaseOrders;
