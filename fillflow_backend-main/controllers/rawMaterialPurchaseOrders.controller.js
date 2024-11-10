const RawMaterialPO = require('../models/RawMaterialPurchaseOrders.model');
const Vendor = require('../models/vendor.model');
const RawMaterial = require('../models/rawMaterial.model');
const RawMaterialPOBatchModel = require('../models/rawMaterialPOBatch.model');
const Records = require('../models/records.model');
const QRCode = require('qr-image');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const RtoOrder = require('../models/rtoOrder.model');
require('dotenv').config(); 


//create a random number
function generateRandomNumber(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

//generating a a unique number based on the min, max and set passed
async function generateUniqueNumber(min, max, set) {
  let unique = false;
  let number;
  while (!unique) {
    number = generateRandomNumber(min, max);
    if (!set.has(number)) {
      unique = true;
    }
  }
  return number;
}

async function generateUniqueGRN(set) {
  return await generateUniqueNumber(100000, 999999, set);
}

async function generateUniqueBatchNumber(set) {
  return await generateUniqueNumber(10000, 99999, set);
}


// Initialize records with empty arrays
async function initializeRecords() {
  try {
    const initialRecord = new Records({
      grnNumbers: [],
      batchNumbers: [],
    });
    await initialRecord.save();
    console.log('Initial records created successfully');
  } catch (error) {
    console.error('Error creating initial records:', error);
  }
}

exports.createRawMaterialPO = async (req, res) => {
  const data = req.body;
  try {
    const currentUserInfo = req.user;

    const vendorDetail = await Vendor.findOne({ _id: data.vendor_id });

    const vendorNamePrefix = vendorDetail.vendor_name.slice(0, 4).toUpperCase();
    const currentDate = new Date();
    const formattedDate = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const po_number = `${vendorNamePrefix}/PO/${formattedDate}`;

    // generating a random as well as unique GRN number
    let grnNumber;
    let records = await Records.findOne({});
    if (!records) {
    await initializeRecords();
    records = await Records.findOne({}); // Use the outer 'records' variable
    }
    const grnSet = new Set(records.grnNumbers);
    grnNumber = await generateUniqueGRN(grnSet);
    grnSet.add(grnNumber);
    records.grnNumbers = Array.from(grnSet);
    await records.save();
    
    const promises = data.formData.map(async (item) => {
      return RawMaterialPO.create({
        bill_number: item.bill_number,
        grn_number: grnNumber,
        po_number,
        vendor_id: item.vendor_id,
        warehouse_id: currentUserInfo?.data?.warehouseId[0],
        raw_material_id: item.raw_material_id,
        quantity: item.quantity,
        weight: item.weight,
        created_by: currentUserInfo?.data?._id,
      });
    });

    await Promise.all(promises);

    return res.status(200).json({
      success: true,
      message: 'All POs created successfully',
    });
  } catch (err) {
    console.log('error====', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateQcInfo = async (req, res) => {
  try {
    const { po_id } = req.params;
    const updateData = req.body;
    const currentUserInfo = req.user;

    // Fetch the PO data
    const PO_data = await RawMaterialPO.findById(po_id);
    
    if (!PO_data) {
      return res.status(404).json({
        success: false,
        message: 'PO not found',
      });
    }

    // Check if PO status is neither 'fulfilled' nor 'qc_info_added'
    if (PO_data.status !== 'fulfilled' && PO_data.status !== 'qc_info_added') {
      
      // Update PO status and QC data
      PO_data.status = updateData.status;
      PO_data.qcData = updateData.formData;
      await PO_data.save();

      // Fetch the records for batch number generation
      const records = await Records.findOne({});
      if (!records) {
        return res.status(500).json({
          success: false,
          message: 'Records not found',
        });
      }

      // Generate a unique batch number
      const batchSet = new Set(records.batchNumbers);
      const batchNumber = await generateUniqueBatchNumber(batchSet);
      
      // Check if batchNumber was generated successfully
      if (!batchNumber) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate batch number',
        });
      }

      // Update records with new batch number
      batchSet.add(batchNumber);
      records.batchNumbers = Array.from(batchSet);
      await records.save();

      // Create a new batch entry
      await RawMaterialPOBatchModel.create({
        po_id: PO_data._id,
        raw_material_id: PO_data.raw_material_id,
        batch_number: batchNumber,
        quantity: updateData.formData.passedQcInfo,
        created_by: currentUserInfo?.data?._id,
      });

      // Successful response
      res.status(200).json({
        success: true,
        message: 'PO updated successfully',
      });

    } else {
      console.error('PO is already fulfilled or qc_info_added');
      return res.status(400).json({
        success: false,
        message: 'PO already fulfilled or QC info already added',
      });
    }
  } catch (error) {
    console.error('Error updating PO:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


exports.updateRawMaterialPO = async (req, res) => {
  try {

    const { po_id } = req.params; // PO ID from route parameters
  
    // Find the purchase order by ID
    const PO_data = await RawMaterialPO.findById(po_id);
    if (!PO_data) {
      return res.status(404).json({
        success: false,
        message: 'PO not found',
      });
    }

    // Check if the purchase order has already been fulfilled
    if (PO_data.status !== 'fulfilled') {
      PO_data.status = 'fulfilled'; // Update the status to fulfilled
      // Save the updated purchase order
      await PO_data.save();

      // Find the corresponding raw material by ID
      const rawMaterial = await RawMaterial.findById(PO_data.raw_material_id);
      if (rawMaterial) {
        // Update the raw material stock and QC count based on the passedQcInfo and failedQcInfo
        rawMaterial.current_stock += parseInt(
          PO_data.qcData.passedQcInfo,
          10
        );
        rawMaterial.failedQcCount += parseInt(
          PO_data.qcData.failedQcInfo,
          10
        );

        // Save the updated raw material information
        await rawMaterial.save();

        // Send success response
        return res.status(200).json({
          success: true,
          message: 'PO updated successfully',
        });
      } else {
        console.error('RawMaterial not found');
        return res.status(404).json({
          success: false,
          message: 'RawMaterial not found',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'PO already fulfilled',
      });
    }
  } catch (error) {
    console.error('Error updating PO:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


exports.generateBatchStickers = async (req, res) => {
  try {
    const { po_id } = req.params;
    const currentDate = moment().format('YYYY-MM-DD');

    // Fetch PO data
    const PO_data = await RawMaterialPO.findById(po_id);
    if (!PO_data) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }


    // Fetch PO batch data
    const poBatchData = await RawMaterialPOBatchModel.findOne({ po_id });
    if (!poBatchData) {
      return res.status(404).json({
        success: false,
        message: 'Batch data not found',
      });
    }

    //Fetching Raw Material Data
    const rawMaterial = await RawMaterial.findById(PO_data.raw_material_id);

    // Initialize PDF document
    const doc = new PDFDocument({
      size: [50 * 2.83465, 25 * 2.83465],
      margin: 0,
    }); // 50mm by 25mm in points
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="QR_Codes_${poBatchData.batch_number}_${currentDate}.pdf"`
      );

      res.status(200).send(pdfData);
    });

    doc.fontSize(5);
    // Generate QR codes and add them to the PDF
    for (let i = 0; i < PO_data.qcData.passedQcInfo; i++) {
      const qrCodeData = poBatchData.batch_number.toString();
      const qrCodeDataURL = QRCode.imageSync(qrCodeData, {
        type: 'png',
      });

      doc.image(qrCodeDataURL, 5, 5, { width: 65, height: 65 });

      doc.text(
        `Batch Number: ${poBatchData.batch_number}`,
        70,
        10,
        (align = 'right')
      );
      doc.text(`SFG SKU CODE: `, 70, 20, (align = 'right'));
      doc.text(`${rawMaterial.sku_code}`, 70, 30, (align = 'right'));
      doc.text(`SFG NAME: `, 70, 40, (align = 'right'));
      doc.text (`${rawMaterial.material_name}`, 70, 50, (align = 'right'));

      if (i < PO_data.qcData.passedQcInfo - 1) doc.addPage();
    }

    doc.end();
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getAllFulfilledPO = async (req, res) => {
  try {
    // Find all POs with status "fulfilled"
    const fulfilledPOs = await RawMaterialPO.find({
      status: 'fulfilled',
    }).populate('created_by');

    return res.status(200).json({
      success: true,
      data: fulfilledPOs,
      message: 'Successfully find the POs.',
    });
  } catch (error) {
    console.error('Error fetching fulfilled POs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getAllPOs = async (req, res) => {
  try {
    const allPOs = await RawMaterialPO.find()
      .populate('vendor_id')
      .populate('raw_material_id')
      .populate('created_by');

    return res.status(200).json({
      success: true,
      data: allPOs,
      message: 'Successfully find the POs.',
    });
  } catch (error) {
    console.error('Error fetching fulfilled POs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getPOById = async (req, res) => {
  try {
    const { po_id } = req.params;

    const poData = await RawMaterialPO.findById(po_id)
      .populate('raw_material_id')

    if (!poData) {
      return res.status(404).json({
        success: false,
        message: 'PO not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: poData,
      message: 'Successfully find the PO.',
    });
  } catch (error) {
    console.error('Error fetching PO:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.createRawMaterialPOFromRTOOrder = async (req, res) => {
  const data = req.body;
  try {
    const currentUserInfo = req.user;

    // Generate PO number
    const currentDate = new Date();
    const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const po_number = `RTO/PO/${formattedDate}`;

    // Generate a unique GRN number
    let grnNumber;
    let records = await Records.findOne({});
    if (!records) {
      await initializeRecords();
      records = await Records.findOne({}); // Use the outer 'records' variable
    }
    const grnSet = new Set(records.grnNumbers);
    grnNumber = await generateUniqueGRN(grnSet);
    grnSet.add(grnNumber);
    records.grnNumbers = Array.from(grnSet);
    await records.save();

    // Create the RTO Order
    const rtoOrder = new RtoOrder({
      orderId: data.formData.order_id,
      awbNumber: data.formData.awb_number,
      sourcePlatform: data.formData.source_platform,
      logisticsPartner: data.formData.logistic_partner,
      created_by: currentUserInfo?.data?._id,
      returnedItems: data.rawMaterials.map(item => ({
        sku: item.raw_material_id,
        quantity: parseInt(item.quantity, 10),
      })),
    });
    await rtoOrder.save();

    // Handle image uploads if any
    if (data.uploadedImages.length > 0) {
      // Logic to handle image saving (optional based on your requirement)
      // For example, you might save images to a specific directory or a database.
      // Add image processing logic here if required
    }

    
    // Create Raw Material PO entries
    const promises = data.rawMaterials.map(async (item) => {
      return RawMaterialPO.create({
        grn_number: grnNumber,
        po_number,
        vendor_id: process.env.RTO_ORIGIN_VENDOR_ID,
        warehouse_id: currentUserInfo?.data?.warehouseId[0],
        raw_material_id: item.raw_material_id,
        quantity: parseInt(item.quantity, 10),
        weight: parseFloat(item.weight),
        created_by: currentUserInfo?.data?._id,
      });
    });

    // If there are no raw materials and no images, handle accordingly
    if (data.rawMaterials.length === 0 && data.uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No raw materials or images provided',
      });
    }

    await Promise.all(promises);

    return res.status(200).json({
      success: true,
      message: 'All POs and RTO Order created successfully',
    });
  } catch (err) {
    console.log('error====', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
