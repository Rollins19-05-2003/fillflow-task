const Warehouse = require("../models/warehouse.model");

exports.createWarehouse = async (req, res) => {
  const data = req.body;
  try {
    const newWarehouse = await Warehouse.create({
      warehouse_name: data.warehouse_name,
      warehouse_address: data.warehouse_address,
    });
    if (!newWarehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse is not created.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "SuccessFully created the Warehouse",
      data: newWarehouse,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
