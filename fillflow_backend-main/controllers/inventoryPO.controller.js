const InventoryPO = require('../models/inventoryPO.model');
const Product = require('../models/product.model');
const qrCodRecords = require('../models/qrCodeRecords.model');

exports.createInventoryPO = async (req, res) => {
  const data = req.body;
  try {
    const currentUserInfo = req.user;
    // Create an array to store all the new inventory POs
    const newInventoryPOs = [];

    // Iterate over the array of data
    for (const item of data) {
      const newInventoryPO = await InventoryPO.create({
        product_id: item.product_id,
        quantity: item.quantity,
        createdBy: currentUserInfo?.data?._id,
      });

      // Add the newly created inventory PO to the array
      newInventoryPOs.push(newInventoryPO);

      if (!newInventoryPO) {
        return res.status(404).json({
          success: false,
          message: 'Inventory PO creation failed for one of the items',
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully created the Inventory POs',
      data: newInventoryPOs,
    });
  } catch (err) {
    console.error("Error creating Inventory POs:", err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


exports.getAllInventoryPo = async (req, res) => {
  try {
    const allInventoryPOs = await InventoryPO.find()
      .populate('product_id')
      .populate('createdBy')
      .populate('fulfilledBy');

    if (!allInventoryPOs || allInventoryPOs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inventory POs found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully retrieved all inventory POs',
      data: allInventoryPOs,
    });
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getInventoryPoById = async (req, res) => {
  try {
    const inventoryPOs = await InventoryPO.findById(req.params.poId)
      .populate('product_id')
      .populate('createdBy')
      .populate('fulfilledBy');

    if (!inventoryPOs || inventoryPOs.length === 0) {
      return res.status(404).json({
        success: false,

        message: 'No inventory POs found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully retrieved inventory POs',
      data: inventoryPOs,
    });
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateInventoryPo = async (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  const currentUserInfo = req.user;

  try {
    const inventoryPOData = await InventoryPO.findById(id);
    const productDetail = await Product.findById(inventoryPOData.product_id);

    if (!inventoryPOData) {
      return res.status(404).json({
        success: false,
        message: 'Inventory PO not found',
      });
    }

    if (inventoryPOData.status !== 'fulfilled') {
      const updatedInventoryPO = await InventoryPO.findByIdAndUpdate(
        id,
        { ...newData, fulfilledBy: currentUserInfo?.data?._id },
        { new: true }
      );

      // Loop over the formData key-value pairs
      Object.entries(newData.formData).forEach(async ([key, value]) => {
        
        try {
          // Find the qrCodeRecord based on the value
          const qrCodeRecord = await qrCodRecords.findOne({ qr_code: value });
          if (qrCodeRecord) {
            // Make changes to the current qrCodeRecord
            qrCodeRecord.is_inwarded = true;
            qrCodeRecord.current_status = 'Inwarded';
            qrCodeRecord.inventory_po_info = id;

            // Save the updated qrCodeRecord
            await qrCodeRecord.save();
          }
        } catch (err) {
          console.log('Error:', err);
        }
      });

      // Push each barcode individually
      Object.values(newData.formData).forEach((barcode) => {
        inventoryPOData.barCodes.push(barcode);
      });

      await inventoryPOData.save();

      productDetail.current_stock += updatedInventoryPO.quantity;
      await productDetail.save();

      return res.status(200).json({
        success: true,
        message: 'Inventory PO updated successfully',
        data: updatedInventoryPO,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Inventory PO is already fulfilled',
      });
    }
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
