const RawMaterial = require("../models/rawMaterial.model");
const RawMaterialPOBatchModel = require('../models/rawMaterialPOBatch.model');
const mongoose = require('mongoose');

exports.createRawMaterial = async (req, res) => {
  const data = req.body;
  try {
    const newRawMaterial = new RawMaterial({
      material_name: data.material_name,
      material_description: data.material_description,
      material_category_id: data.material_category_id,
      unit_of_measure: data.unit_of_measure,
      current_stock: data.current_stock,
      warehouse_id: data.warehouse_id,
      sku_code: data.sku_code,
      unit_price: data.unit_price,
      lower_threshold: data.lower_threshold,
      upper_threshold: data.upper_threshold,
      zoho_item_id: data.zoho_item_id,
    });
    await newRawMaterial.save();

    // Create a new batch for the raw materials being added with the existing current stock count as the quantity
    await RawMaterialPOBatchModel.create({      
      raw_material_id: newRawMaterial._id,
      batch_number: 100,
      quantity: data.current_stock,
    });

    
    if (!newRawMaterial._id) {
      return res.status(404).json({
        success: false,
        message: "Raw material is not created.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully created the Raw material",
      data: newRawMaterial,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getAllRawMaterials = async (req, res) => {
  try {
    // Fetch all raw materials from the database
    const allRawMaterials = await RawMaterial.find().populate(
      "material_category_id"
    );

    // Check if raw materials exist
    if (!allRawMaterials || allRawMaterials.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No raw materials found.",
      });
    }

    // Return success response with raw materials data
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved all raw materials",
      data: allRawMaterials,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllRawMaterialsByCategoryId = async (req, res) => {
  try {
    // Extract category ID from request parameters
    const categoryId = req.params.categoryId;

    // Fetch all raw materials for the given category ID from the database
    const rawMaterials = await RawMaterial.find({
      material_category_id: categoryId,
    });

    // Check if raw materials exist for the given category ID
    // if (!rawMaterials || rawMaterials.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No raw materials found for the given category ID.",
    //   });
    // }

    // Return success response with raw materials data
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved raw materials by category ID",
      data: rawMaterials,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.checkRawMaterialQuantity = async (req, res) => {
  const data = req.body;
  try {
    const rawMaterial = await RawMaterial.findById(data.raw_material_id);
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: "Raw material not found.",
      });
    }

    if (rawMaterial.current_stock >= data.quantity) {
      return res.status(201).json({
        success: true,
        message: "Sufficient raw material in stock",
      });
    } else {
      return res.json({
        success: false,
        status: 404,
        message: `PO can't be raised only ${rawMaterial.current_stock} ${rawMaterial.unit_of_measure} of ${rawMaterial.material_name} is left `,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getSkuCodeById = async (req, res) => {
  try {
    // Extract the raw material ID from the request parameters
    const rawMaterialId = req.params.id;

    // Validate the ObjectId (optional, depends on your use case)
    if (!mongoose.Types.ObjectId.isValid(rawMaterialId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid raw material ID.",
      });
    }

    // Find the raw material by ID
    const rawMaterial = await RawMaterial.findById(rawMaterialId);

    // Check if the raw material exists
    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: "Raw material not found.",
      });
    }

    // Return the SKU code
    return res.status(200).json({
      success: true,
      message: "Successfully retrieved SKU code.",
      data: {
        sku_code: rawMaterial.sku_code,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};