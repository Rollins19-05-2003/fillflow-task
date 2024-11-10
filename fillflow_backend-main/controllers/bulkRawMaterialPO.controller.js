const bulkRawMaterialPO = require("../models/bulkRawMaterialPO.model");
const RawMaterial = require("../models/rawMaterial.model"); 
const RawMaterialPOBatchModel = require("../models/rawMaterialPOBatch.model");

exports.createbulkRawMaterialPO = async (req, res) => {
    const data = req.body;
    try {
        const currentUserInfo = req.user;
    
        const newbulkRawMaterialPO = await bulkRawMaterialPO.create({
        raw_material_id: data.raw_material_id,
        quantity: data.quantity,
        createdBy: currentUserInfo?.data?._id,
        bulkOrderReference: data.bulkOrderReference,
        });
    
        if (!newbulkRawMaterialPO) {
        return res.status(404).json({
            success: false,
            message: "newbulkRawMaterialPO is not created",
        });
        } else {
        const rawMaterial = await RawMaterial.findByIdAndUpdate(
            data.raw_material_id
        );
        if (!rawMaterial) {
            return res.status(404).json({
            success: false,
            message: "Raw material not found.",
            });
        }
        }
    
        return res.status(200).json({
        success: true,
        message: "SuccessFully created the B2B PO",
        data: newbulkRawMaterialPO,
        });
    } catch (err) {
        console.log("bulkRawMaterialPO===", err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
};

exports.getAllbulkRawMaterialPO = async (req, res) => {
    try {
        const allbulkRawMaterialPOs = await bulkRawMaterialPO.find()
        .populate("raw_material_id")
        .populate("createdBy")
        .populate("fulfilledBy");
    
        if (!allbulkRawMaterialPOs || allbulkRawMaterialPOs.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No B2B PO found",
        });
        }
    
        return res.status(200).json({
        success: true,
        message: "Successfully fetched all B2B POs",
        data: allbulkRawMaterialPOs,
        });
    } catch (err) {
        console.log("bulkRawMaterialPO===", err);
        return res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
};

exports.updatebulkRawMaterialPO = async (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    const currentUserInfo = req.user;  
  
    const bulkRawMaterialPOData = await bulkRawMaterialPO.findById(id);
    const rawMaterialDetail = await RawMaterial.findById(
        bulkRawMaterialPOData.raw_material_id
    );
  
    try {
      // Find the assembly PO by ID and update it
      const updatedbulkRawMaterialPO = await bulkRawMaterialPO.findByIdAndUpdate(
        id,
        { ...newData, fulfilledBy: currentUserInfo?.data?._id },
        {
          new: true, // Return the updated document
        }
      );
  
      bulkRawMaterialPOData.batchData.push(...newData.listData);
      await bulkRawMaterialPOData.save();
    
  
      // decreasing the current stock in the rawmaterial model after fulfilling assembly po
  
      rawMaterialDetail.current_stock -= bulkRawMaterialPOData.quantity;
      await rawMaterialDetail.save();
  
      // decreasing the current stock in the rawmaterialPoBatch model after fulfilling assembly po
  
      newData.listData.forEach(async (item) => {
        // Find rawMaterialPOBatch by batch number id

        const rawMaterialPOBatchDetail = await RawMaterialPOBatchModel.findOne({
          batch_number: item.batchNumber,
        });
  

  
        if (rawMaterialPOBatchDetail) {

          // Adjust quantity
          rawMaterialPOBatchDetail.quantity -= item.quantity;
          await rawMaterialPOBatchDetail.save();
        }
      });
  
      // Check if the assembly PO exists and was updated successfully
      if (!updatedbulkRawMaterialPO) {
        return res.status(404).json({
          success: false,
          message: "Assembly PO not found or could not be updated",
        });
      }

  
      // If the assembly PO was updated successfully, return it
      return res.status(200).json({
        success: true,
        message: "Assembly PO updated successfully",
        data: updatedbulkRawMaterialPO,
      });
    } catch (err) {
      console.log("Error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
