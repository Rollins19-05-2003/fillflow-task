const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendor_name: {
      type: String,
      required: true,
    },
    vendor_address: {
      type: String,
    },
    vendor_phone: {
      type: Number,
    },
    vendor_email: {
      type: String,
    },
    vendor_website: {
      type: String,
    },
    vendor_zoho_contact_id: {
      type: String,
    },
    vendor_gst_identification_number: {
      type: String,
    },
    vendor_point_of_contact: {
      type: String,
    },
    vendor_point_of_contact_phone: {
      type: Number,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create Vendor model
const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
