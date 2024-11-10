const Vendor = require("../models/vendor.model");

exports.createVendor = async (req, res) => {
  const data = req.body;
  try {
    const newVendor = await Vendor.create({
      vendor_name: data.vendor_name,
      vendor_address: data.vendor_address,
      vendor_phone: data.vendor_phone,
      vendor_email: data.vendor_email,
      vendor_website: data.vendor_website,
      vendor_zoho_contact_id: data.vendor_zoho_contact_id,
      vendor_gst_identification_number: data.vendor_gst_identification_number,
      vendor_point_of_contact: data.vendor_point_of_contact,
      vendor_point_of_contact_phone: data.vendor_point_of_contact_phone,
    });
    if (!newVendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor is not created.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "SuccessFully created the Vendor",
      data: newVendor,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    // Fetch all vendors from the database
    const allVendors = await Vendor.find();

    // Check if vendors exist
    if (!allVendors || allVendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors found.",
      });
    }

    // Return success response with vendors data
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved all vendors",
      data: allVendors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
