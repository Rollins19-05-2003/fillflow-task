const axios = require('axios');
const tokenService = require('../services/token.service');
const OrderDetails = require('../models/orderDetails.model'); 
const QRCodeRecords = require('../models/qrCodeRecords.model');
const Mapping = require('../models/productMapping.model');
const MissedSkuCodes = require('../models/missedSKUCodes.model'); 
require('dotenv').config(); 


exports.getOrderDetailsByReferenceCode = async (req, res) => {
  const { referenceCode } = req.params;

  if (!referenceCode) {
    return res.status(400).json({ error: 'Reference Code is required' });
  }

  try {
    // Step 1: Get the token using tokenService
    const token = await tokenService.getToken();

    // Step 2: Make the API call to EasyEcom to get order details
    const response = await axios.get(`${process.env.EASYECOM_BASE_URL}/orders/V2/getOrderDetails`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': process.env.EASYECOM_API_KEY,
      },
      params: {
        reference_code: referenceCode
      }
    });

    const orders = response.data.data; // Assuming response.data contains an array of orders
    const result = [];

    // Step 3: Traverse through each order
    for (const order of orders) {
      const orderId = order.order_id;
      const awbNumber = order.awb_number;

      // Check if the order with the same orderId and awbNumber exists in the database
      const existingOrder = await OrderDetails.findOne({ orderId, awbNumber });

      if (!existingOrder) {
        // Check if AWB number is not null and the shipping status is either "Shipment Created" or "Pickup Scheduled"
        if (order.awb_number && (order.shipping_status === 'Shipment Created' || order.shipping_status === 'Pickup Scheduled')) {
          const orderItems = [];

          // Step 4: Traverse through each order item
          for (const item of order.order_items) {
            const easycomSKU = item.sku;
            const easycomQuantity = item.suborder_quantity;

            // Step 5: Check if there's a mapping for this Easycom SKU
            const mapping = await Mapping.findOne({ easycomSKU });

            if (mapping) {
              // Step 6: Calculate and push IMS SKUs based on the mapping
              mapping.imsMappings.forEach(imsMapping => {
                orderItems.push({
                  sku: imsMapping.imsSKU,
                  quantity: imsMapping.imsQuantity * easycomQuantity / mapping.easycomQuantity
                });
              });
            } else {
              // If no mapping exists, use the original SKU and quantity
              MissedSkuCodes.create({ sku_code: easycomSKU });
              orderItems.push({
                sku: easycomSKU,
                quantity: easycomQuantity
              });
            }
          }

          // Step 7: Construct the result object
          result.push({
            order_id: orderId,
            reference_code: order.reference_code,
            awb_number: awbNumber,
            items: orderItems
          });
        }
      }
    }

    // Step 8: Return the constructed result
    return res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Error fetching order details:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};



exports.saveOrderDetails = async (req, res) => {
  const { orderId, referenceCode, awbNumber, qrCodes } = req.body;

 

  if (!orderId || !referenceCode || !awbNumber || !qrCodes) {
    return res.status(400).json({ error: 'Order ID, reference code, AWB number, and QR codes are required' });
  }

  try {
    // Step 1: Check if a record with the same orderId and awbNumber already exists
    const existingOrder = await OrderDetails.findOne({ orderId, awbNumber });

    if (existingOrder) {
      // If it exists, return an error
      return res.status(201).json({ error: 'This order has already been fulfilled' });
    }

  

    // Step 2: Construct the new order details object
    const newOrderDetails = {
      orderId,
      referenceCode,
      awbNumber,
      fulfilledQRCodes: Object.keys(qrCodes).map(key => ({
        skuCode: key, // Assuming skuCode is derived from the key
        qrCode: qrCodes[key]
      }))
    };

    // Step 3: Save the new order details to the database
    const savedOrder = await OrderDetails.create(newOrderDetails);


    // Step 4: Update the status of the QR codes in the QRCodeRecords collection
    for (const qrCode of savedOrder.fulfilledQRCodes) {
      const qrCodeRecord = await QRCodeRecords.findOne({ qr_code: qrCode.qrCode });

      if (qrCodeRecord) {
        qrCodeRecord.current_status = 'Shipped';
        qrCodeRecord.is_shipped = true;
        qrCodeRecord.order_info = savedOrder._id;
        await qrCodeRecord.save();
      }
    }

    

    // Step 4: Return a success response
    return res.status(200).json({
      success: true,
      message: 'Order details saved successfully',

    });

  } catch (error) {
    console.error('Error processing order data:', error.message);
    return res.status(500).json({ error: 'Failed to process order data' });
  }

};

exports.getAllOrderDetails = async (req, res) => {
  try {
    const orderDetails = await OrderDetails.find();

    if (!orderDetails || orderDetails.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No order details found'
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: orderDetails,
      message: 'Order details retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching order details:', {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};
