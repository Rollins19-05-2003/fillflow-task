const Order = require('../models/order.model');
const Picklist = require('../models/pickList.model');
const Product = require('../models/product.model');
const qrCodRecords = require('../models/qrCodeRecords.model');

function generatePickListNumber() {
  // Generate a random number between 10000 and 99999
  return Math.floor(Math.random() * 90000) + 10000;
}

exports.createPickList = async (req, res) => {
  try {
    const currentUserInfo = req.user;
    const selectedOrderIds = req.body;
    
    if (!Array.isArray(selectedOrderIds) || selectedOrderIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid order IDs' });
    }

    // Fetch orders based on selectedOrderIds
    const orders = await Order.find({ _id: { $in: selectedOrderIds } });

    // Initialize an empty object to store skuCode and totalQuantity
    const skuMap = {};

    // Iterate over orders and aggregate skuCode quantities
    orders.forEach(async (order) => {
      order.listOfProducts.forEach((product) => {
        if (product.status === 'pending') {
        const { skuCode, quantity } = product;
        if (skuMap[skuCode]) {
          skuMap[skuCode] += quantity; // Increment quantity if skuCode already exists
        } else {
          skuMap[skuCode] = quantity; // Add new skuCode with quantity
        }
        product.status = 'picked'; // Update product status to picked
      }
      });
      order.listOfProducts.some(product => product.status === 'pending') ? order.status = 'open' : order.status = 'picked';
      await order.save();
    });

    // Convert the skuMap object into an array of skus with skuCode and totalQuantity
    const skus = Object.entries(skuMap).map(([skuCode, totalQuantity]) => ({
      skuCode,
      totalQuantity,
    }));

    // Create a new Picklist document
    const picklist = new Picklist({
      orderIds: selectedOrderIds,
      skus,
      createdBy: currentUserInfo?.data?._id,
      pickListumber: generatePickListNumber(),
    });

    // Save the Picklist document
    await picklist.save();

    return res.status(200).json({
      success: true,
      message: 'Picklist created',
      data: picklist,
    });
  } catch (error) {
    console.error('Error creating picklist:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the picklist',
      error: error.message,
    });
  }
};

exports.getAllPickLists = async (req, res) => {
  try {
    // Fetch all picklist documents
    const picklists = await Picklist.find().populate('createdBy'); // Assuming you want to populate createdBy field with name and email

    return res.status(200).json({
      success: true,
      message: 'Picklists retrieved successfully',
      data: picklists,
    });
  } catch (error) {
    console.error('Error fetching picklists:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the picklists',
      error: error.message,
    });
  }
};

exports.getPickListById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the picklist document by ID
    const picklist = await Picklist.findById(id).populate('createdBy').populate('fulfilledBy');

    // Check if the picklist exists
    if (!picklist) {
      return res.status(404).json({
        success: false,
        message: 'Picklist not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Picklist retrieved successfully',
      data: picklist,
    });
  } catch (error) {
    console.error('Error fetching picklist:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the picklist',
      error: error.message,
    });
  }
};

exports.updatePickListStatus = async (req, res) => {
  const { id } = req.params;
  const formData = req.body;
  const currentUserInfo = req.user;
  

  try {
    const pickListDetail = await Picklist.findById(id);
    if (!pickListDetail) {
      return res.status(404).json({
        success: false,
        message: 'PickList is not found',
      });
    }

    pickListDetail.status = 'fulfilled';
    pickListDetail.fulfilledBy = currentUserInfo?.data?._id;

    if (!pickListDetail.fulfillPickListQrCodes) {
      pickListDetail.fulfillPickListQrCodes = [];
    }

    Object.keys(formData).forEach((key) => {
      pickListDetail.fulfillPickListQrCodes.push({
        skuCode: key,
        qrCode: formData[key],
      });
    });

    // Loop over the formData key-value pairs
    Object.entries(formData).forEach(async ([key, value]) => {
       
        
      try {
        // Find the qrCodeRecord based on the value
        const qrCodeRecord = await qrCodRecords.findOne({ qr_code: value });
        if (qrCodeRecord) {
          // Make changes to the current qrCodeRecord
          qrCodeRecord.is_outwarded = true;
          qrCodeRecord.current_status = 'Outwarded';
          qrCodeRecord.picklist_info = id;

          // Save the updated qrCodeRecord
          await qrCodeRecord.save();
        }
      } catch (err) {
        console.log('Error:', err);
      }
    });

    

    await pickListDetail.save();



    //Finding product and updating stock
    pickListDetail.skus.map(async (item, indx) => {
      const productDetail = await Product.findOne({ sku_code: item?.skuCode });
      productDetail.current_stock -= item.totalQuantity;

      await productDetail.save();
    });

    return res.status(200).json({
      success: true,
      message: 'Picklist updated Successfully',
    });
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
