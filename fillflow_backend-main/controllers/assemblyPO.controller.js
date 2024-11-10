const AssemblyPO = require("../models/assemblyPO.model");
const RawMaterial = require("../models/rawMaterial.model");
const RawMaterialPOBatchModel = require("../models/rawMaterialPOBatch.model");

// for raising sfg assemby po
exports.createAssemblyPO = async (req, res) => {
  const data = req.body;
  try {
    const currentUserInfo = req.user;

    const newAssemblyPO = await AssemblyPO.create({
      raw_material_id: data.raw_material_id,
      quantity: data.quantity,
      createdBy: currentUserInfo?.data?._id,
    });

    if (!newAssemblyPO) {
      return res.status(404).json({
        success: false,
        message: "newAssemblyPO is not created",
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
      // else {
      //   rawMaterial.current_stock = rawMaterial.current_stock - data.quantity;
      //   await rawMaterial.save();
      // }
    }

    return res.status(200).json({
      success: true,
      message: "SuccessFully created the Assembly PO",
      data: newAssemblyPO,
    });
  } catch (err) {
    console.log("assemblt===", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllAssemblyPo = async (req, res) => {
  try {
    const allAssemblyPOs = await AssemblyPO.find()
      .populate("raw_material_id")
      .populate("createdBy")
      .populate("fulfilledBy");

    if (!allAssemblyPOs || allAssemblyPOs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No assembly POs found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved all assembly POs",
      data: allAssemblyPOs,
    });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateAssemblyPo = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  const currentUserInfo = req.user;

  try {
    // 1. Find the Assembly PO by ID
    const assemblyPOData = await AssemblyPO.findById(id);
    if (!assemblyPOData) {
      return res.status(404).json({
        success: false,
        message: "Assembly PO not found",
      });
    }

    // 2. Update the status and add the list data to batchData
    assemblyPOData.status = newData.status;
    assemblyPOData.batchData.push(...Object.keys(newData.listData).map(batchNumber => ({
      batchNumber,
      quantity: newData.listData[batchNumber],
    })));
    assemblyPOData.fulfilledBy = currentUserInfo?.data?._id;
    
    await assemblyPOData.save();

    // 3. Get the raw material based on raw material ID
    const rawMaterialDetail = await RawMaterial.findById(assemblyPOData.raw_material_id);
    if (!rawMaterialDetail) {
      return res.status(404).json({
        success: false,
        message: "Raw Material not found",
      });
    }

    // Deduct the raw material current stock by the quantity of the Assembly PO
    rawMaterialDetail.current_stock -= assemblyPOData.quantity;
    await rawMaterialDetail.save();

    // 4. Traverse through the listData and update batch quantities
    await Promise.all(Object.keys(newData.listData).map(async (batchNumber) => {
      const batchQuantity = newData.listData[batchNumber];

      const rawMaterialPOBatchDetail = await RawMaterialPOBatchModel.findOne({ batch_number: batchNumber });
      if (rawMaterialPOBatchDetail) {
        rawMaterialPOBatchDetail.quantity -= batchQuantity;
        await rawMaterialPOBatchDetail.save();
      }
    }));

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: "Assembly PO updated successfully",
      data: assemblyPOData,
    });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.getAssemblyPoById = async (req, res) => {
  const { id } = req.params;

  try {
    const assemblyPO = await AssemblyPO.findById(id)
      .populate("raw_material_id");

    if (!assemblyPO) {
      return res.status(404).json({
        success: false,
        message: "Assembly PO not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully retrieved assembly PO",
      data: assemblyPO,
    });
  } catch (err) {
    console.log("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }};