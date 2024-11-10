const RawMaterialPOBatchModel = require("../models/rawMaterialPOBatch.model");

exports.getPOBatchModelsByRawMaterialId = async (req, res) => {
  try {
    const { raw_material_id } = req.params;
    const poBatchModels = await RawMaterialPOBatchModel.find({
      raw_material_id,
    })
      .populate("po_id")
      .populate("raw_material_id")
      .populate("created_by")

      res.status(200).json({
      success: true,
      message: "Successfully get PO Batch Models by Raw Material ID",
      data: poBatchModels,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.getPOBatchModelTransformedDataByRawMaterialId = async (req, res) => {
  try {
    const { raw_material_id } = req.params;
    const poBatchModels = await RawMaterialPOBatchModel.find({
      raw_material_id,
    });
    const transformedData = poBatchModels.reduce((acc, model) => {
      acc[model.batch_number] = model.quantity;
      return acc;
    }, {});
      res.status(200).json({
      success: true,
      message: "Successfully get PO Batch Models And Quantities by Raw Material ID",
      data: transformedData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPOBatchModelNumberByPOId = async (req, res) => {
  try {
    const { po_id } = req.params;
    const poBatchModel = await RawMaterialPOBatchModel.find({
      po_id,
    })
    const poBatchNumberArray = poBatchModel.map((poBatch) => poBatch.batch_number);
    const poBatchNumber = Number(poBatchNumberArray[0]);
      res.status(200).json({
      success: true,
      message: "Successfully get PO Batch Models by PO ID",
      data: poBatchNumber,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}
