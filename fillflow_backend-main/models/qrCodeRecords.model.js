const mongoose = require("mongoose");

// QR Code Record Schema
const qrCodeRecordSchema = new mongoose.Schema(
  {
    qr_code: {
        type: String,
        required: true,
        unique: true, // Assuming each QR code is unique
      },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    current_status: {
        type: String,
        enum: ['Pending','Inwarded', 'Outwarded', 'Shipped'],
        default: 'Pending',
        required: true,
    },
    is_inwarded: {
      type: Boolean,
      default: false,
    },
    inventory_po_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryPO",
    },
    is_outwarded: {
      type: Boolean,
      default: false,
    },
    picklist_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Picklist",
    },
    is_shipped: {
      type: Boolean,
      default: false,
    },
    order_info: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderDetails",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);



// Create QRCodeRecords model
const QRCodeRecords = mongoose.model("QRCodeRecord", qrCodeRecordSchema);

module.exports = QRCodeRecords;
