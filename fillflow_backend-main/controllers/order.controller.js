const Order = require('../models/order.model');
const csv = require('csv-parser');
const { Readable } = require('stream');
const Product = require('../models/product.model');
const qrCodeRecords = require('../models/qrCodeRecords.model');


exports.createCustomOrder = async (req, res) => {
  try {
    const currentUserInfo = req.user;
    const data = req.body;

    // Check if the orderId already exists
    if (data.orderId) {
      const existingOrder = await Order.findOne({ orderId: data.orderId });
      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: `Order ID ${data.orderId} already exists. Please use a unique Order ID.`,
        });
      }
    }

    // Fetch product details using product IDs and replace them with SKU codes
    const productPromises = data.listOfProducts.map(async (product) => {
      const productDetails = await Product.findById(product.skuCode);
      if (!productDetails) {
        throw new Error(`Product with ID ${product.skuCode} not found`);
      }
      return {
        skuCode: productDetails.sku_code,
        quantity: product.quantity,
      };
    });

    const updatedProducts = await Promise.all(productPromises);

    // Create the order
    const createdOrder = await Order.create({
      created_by: currentUserInfo?.data?._id,
      ...(data.orderId && { orderId: data.orderId }),
      ...(data.platform && { platform: data.platform }),
      ...(data.orderDate && { orderDate: data.orderDate }),
      ...(data.scheduledDispatchDate && { scheduledDispatchDate: data.scheduledDispatchDate }),
      ...(data.orderTitle && { orderTitle: data.orderTitle }),
      ...(data.retailer && { retailer: data.retailer }),
      ...(data.location && { location: data.location }),
      ...(data.trackingNumber && { trackingNumber: data.trackingNumber }),
      ...(data.remarks && { remarks: data.remarks }),
      listOfProducts: updatedProducts || [],
    });

    return res.status(200).json({
      success: true,
      data: createdOrder,
      message: 'Successfully created the order',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating the custom order',
      error: error.message,
    });
  }
};


exports.uploadAmazonCSV = async (req, res) => {
  try {
    const currentUserInfo = req.user;
    const upload = require('../config/upload');

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file uploaded' });
      }

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(
          csv({
            mapHeaders: ({ header }) => {
              // Normalize headers
              switch (header) {
                case 'Shipment Creation Date':
                  return 'orderDate';
                case 'MSKU':
                  return 'skuCode';
                case 'Title':
                  return 'orderTitle';
                case 'Shipment Tracking ID':
                  return 'AWB';
                case 'Customer Order ID':
                  return 'orderId';
                case 'Units':
                  return 'quantity';

                default:
                  return header;
              }
            },
          })
        )
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              const existingOrder = await Order.findOne({
                orderId: row.orderId,
              });

              //   if (existingOrder) {
              //     // If order exists, update the listOfProducts array
              //     existingOrder.listOfProducts.push({
              //       skuCode: row.skuCode,
              //       quantity: row.quantity,
              //     });

              //     existingOrder.AWB.push(row.AWB);

              //     await existingOrder.save();
              //   }

              if (existingOrder) {
                // If order exists, check if AWB is different
                if (!existingOrder.AWB.includes(row.AWB)) {
                  // If AWB is different, update AWB array and add products
                  existingOrder.AWB.push(row.AWB);
                  existingOrder.listOfProducts.push({
                    skuCode: row.skuCode,
                    quantity: row.quantity,
                  });
                  await existingOrder.save();
                } else {
                  // If AWB is same, update the listOfProducts array
                  existingOrder.listOfProducts.push({
                    skuCode: row.skuCode,
                    quantity: row.quantity,
                  });
                  await existingOrder.save();
                }
              } else {
                // If order doesn't exist, create a new order entry
                await new Order({
                  created_by:
                    currentUserInfo?.data?._id || '663cb03b8422f04c86bf716a',
                  orderId: row.orderId,
                  platform: 'Amazon',
                  AWB: [row.AWB], // Start with an array containing the current AWB
                  orderDate: row.orderDate,
                  orderTitle: row.orderTitle,
                  listOfProducts: [
                    {
                      skuCode: row.skuCode,
                      quantity: row.quantity,
                    },
                  ],
                }).save();
              }
            }

            //   else {
            //     // If order doesn't exist, create a new order
            //     const newOrder = new Order({
            //       created_by:
            //         currentUserInfo?.data?._id || "663cb03b8422f04c86bf716a",
            //       orderId: row.orderId,
            //       platform: row.platform,
            //       AWB: row.AWB,
            //       orderDate: row.orderDate,
            //       orderTitle: row.orderTitle,
            //       listOfProducts: [
            //         {
            //           skuCode: row.skuCode,
            //           quantity: row.quantity,
            //         },
            //       ],
            //     });
            //     await newOrder.save();
            //   }
            // }

            return res.status(200).json({
              success: true,
              message: 'CSV file processed successfully',
              data: results,
            });
          } catch (dbError) {
            return res.status(500).json({
              success: false,
              message: 'Error saving data to database',
              error: dbError.message,
            });
          }
        });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing the CSV file',
      error: error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the orders',
      error: error.message,
    });
  }
};

exports.getAllCustomOrders = async (req, res) => {
  try {
    // Define the platforms to filter by
    const allowedPlatforms = ['Custom', 'Custom - Amazon', 'Custom - EasyEcom', 'B2B'];

    // Find all orders where the platform is one of the allowed platforms
    const orders = await Order.find({ platform: { $in: allowedPlatforms } });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the custom orders',
      error: error.message,
    });
  }
};


exports.getAllOpenOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'open' });
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the orders',
      error: error.message,
    });
  }
};

exports.uploadEasyEcomCSV = async (req, res) => {
  try {
    const currentUserInfo = req.user;
    const upload = require('../config/upload');
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file uploaded' });
      }

      const results = [];
      const stream = Readable.from(req.file.buffer.toString());

      stream
        .pipe(
          csv({
            mapHeaders: ({ header }) => {
              // Normalize headers
              switch (header) {
                case 'Order Date':
                  return 'orderDate';
                case 'Reference Code':
                  return 'orderId';
                case 'Accounting Sku':
                  return 'skuCode';
                case 'Product Name':
                  return 'orderTitle';
                case 'AWB No':
                  return 'AWB';
                case 'Suborder Quantity':
                  return 'quantity';
                case 'ExSD':
                  return 'meta1';
                case 'Assigned to picklist':
                  return 'meta2';
                case 'Packed':
                  return 'meta3';
                case 'Actual Shipout Date':
                  return 'meta4';
                case 'Manifested At':
                  return 'manifestedAt';
                case 'Order Status':
                  return 'orderStatusRow';
                case 'Suborder No':
                  return 'subOrderNumber';
                  case 'Batch ID':
                  return 'batchID';
                default:
                  return header;
              }
            },
            mapValues: ({ header, index, value }) => {
              // Remove unwanted characters from SKU and AWB fields and suborder Number
              if (
                header === 'skuCode' ||
                header === 'AWB' ||
                header === 'subOrderNumber'
              ) {
                return value.replace(/^`+/, ''); // Remove leading backticks
              }
              return value;
            },
          })
        )
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              const existingOrder = await Order.findOne({
                orderId: row.orderId,
              });

              // checking if the manifestedAt has any data or not , and also if the status is cancelled then the order status will be closed
                const productStatus =
                    row.orderStatusRow &&
                    row.orderStatusRow.toLowerCase() === 'cancelled'
                      ? 'closed'
                      : row.orderStatusRow &&
                        row.orderStatusRow.toLowerCase() === 'shipped'
                      ? 'shipped'
                      : row.manifestedAt
                      ? row.manifestedAt.trim() !== ''
                        ? 'closed'
                        : 'pending'
                      : 'pending';

                 const orderStatus = productStatus === 'closed' ? 'closed' : 'open';

              if (existingOrder) {
                if (
                  !existingOrder.subOrderNumber.includes(row.subOrderNumber)
                ) {
                  if (!existingOrder.AWB.includes(row.AWB)) {
                    // If order exists, check if AWB is different
                    // If AWB is different, update AWB array and add products
                    existingOrder.AWB.push(row.AWB);
                    existingOrder.subOrderNumber.push(row.subOrderNumber);
                    existingOrder.listOfProducts.push({
                      skuCode: row.skuCode,
                      quantity: row.quantity,
                      AWBReference: row.AWB,
                      status: productStatus,
                    });
                  } else {
                    existingOrder.subOrderNumber.push(row.subOrderNumber);

                    // If AWB is same, update the listOfProducts array
                    existingOrder.listOfProducts.push({
                      skuCode: row.skuCode,
                      quantity: row.quantity,
                      AWBReference: row.AWB,
                      status: productStatus,
                    });
                  }
                  existingOrder.listOfProducts.some(product => product.status === 'pending') ? existingOrder.status = 'open' : existingOrder.status = 'picked';
                  await existingOrder.save();
                }
              } else {
                // If order doesn't exist, create a new order entry
                await new Order({
                  created_by:
                    currentUserInfo?.data?._id || '663cb03b8422f04c86bf716a',
                  orderId: row.orderId,
                  platform: 'EasyEcom',
                  AWB: [row.AWB], // Start with an array containing the current AWB
                  orderDate: row.orderDate,
                  batchID : row.batchID,
                  orderTitle: row.orderTitle,
                  listOfProducts: [
                    {
                      skuCode: row.skuCode,
                      quantity: row.quantity,
                      AWBReference: row.AWB,
                      status: productStatus,
                    },
                  ],
                  status: orderStatus,
                  subOrderNumber: [row.subOrderNumber],
                  meta: {
                    meta1: row.meta1,
                    meta2: row.meta2,
                    meta3: row.meta3,
                    meta4: row.meta4,
                  },
                }).save();
              }
            }

            return res.status(200).json({
              success: true,
              message: 'CSV file processed successfully',
              data: results,
            });
          } catch (dbError) {
            return res.status(500).json({
              success: false,
              message: 'Error saving data to database',
              error: dbError.message,
            });
          }
        });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing the CSV file',
      error: error.message,
    });
  }
};

exports.getOrderByOrderId = async (req, res) => {
  try {
    const orders = await Order.findOne({ orderId: req.params.id });


    if (!orders) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // if (orders.status === 'shipped') {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Order is Already Fulfilled, try with another order id.',
    //   });
    // }

    
    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the orders',
      error: error.message,
    });
  }
};

exports.getOrderByAWBNumber = async (req, res) => {
  try {
    const orders = await Order.findOne({ AWB: { $in: [req.params.id] } });

    if (orders.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Order is Already Fulfilled, try with another AWB number.',
      });
    }

    let modifiedProductList = [];
    orders.listOfProducts.forEach((product) => {
      if (product.AWBReference === req.params.id && product.status === 'picked') {
        modifiedProductList.push(product);
      }
    });

    orders.listOfProducts = modifiedProductList;

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the orders',
      error: error.message,
    });
  }
};

exports.updateOrderByOrderId = async (req, res) => {
  try {
    const currentUserInfo = req.user;
    let orders = await Order.findOne({ orderId: req.params.orderId });

    // Check if the order was found
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    

    if (!orders.fulfillOrderQrCodes) {
      orders.fulfillOrderQrCodes = [];
    }

    const values = req.body;


   // Populate fulfillOrderQrCodes
Object.keys(values).forEach((key) => {
  // Find the index of the last hyphen
  const lastHyphenIndex = key.lastIndexOf('-');
  const sku = lastHyphenIndex !== -1 ? key.substring(0, lastHyphenIndex) : key;

  // Find the product based on sku
  const product = orders.listOfProducts.find((product) => product.skuCode === sku);
  
  if (product) {
    // Check if fulfilledQuantity exists, if not set it to 1, otherwise increment
    if (product.fulfilledQuantity === undefined) {
      product.fulfilledQuantity = 1; // Initialize to 1 if it doesn't exist
    } else {
      product.fulfilledQuantity += 1; // Increment if it already exists
    }
  }

  orders.fulfillOrderQrCodes.push({
    skuCode: key,
    qrCode: values[key],
  });
});

    // Use Promise.all to handle async operations properly
    await Promise.all(
      Object.entries(values).map(async ([key, value]) => {
        try {
          const qrCodeRecord = await qrCodeRecords.findOne({ qr_code: value });

          
          if (qrCodeRecord) {
            qrCodeRecord.is_shipped = true;
            qrCodeRecord.current_status = 'Shipped';
            qrCodeRecord.order_info = orders._id; // Use orders._id instead of orderMongoID
            await qrCodeRecord.save();
          } else {
            console.log(`QR code record not found for: ${value}`);
          }
        } catch (err) {
          console.error('Error updating QR code record:', err);
        }
      })
    );

    let isOrderFulfilled = true;
    orders.listOfProducts.forEach((product) => {
      if (product.quantity > product.fulfilledQuantity) {
        isOrderFulfilled = false;
      }
    });

    if (isOrderFulfilled) {
      orders.status = 'shipped';
      orders.fulfilledBy = currentUserInfo?.data?._id;
      orders.fulfilledAt = new Date();
    }

    // Save the updated order
    await orders.save();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('An error occurred:', error); // Log the full error object for debugging
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the order',
      error: error.message,
    });
  }
};


exports.editOrderByOrderInternalId = async (req, res) => {
  try {
    const { orderInternalId, orderId, orderTitle, trackingNumber, remarks , status} = req.body;


    // Check if `orderInternalId` is provided
    if (!orderInternalId) {
      return res.status(400).json({
        success: false,
        message: 'Order key is required to update the order.',
      });
    }

    // Find the order by `orderInternalId`
    const order = await Order.findById(orderInternalId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Update the fields if provided
    if (orderId) order.orderId = orderId;
    if (orderTitle) order.orderTitle = orderTitle;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (remarks) order.remarks = remarks;
    if (status === "shipped") order.status = status;

    // Save the updated order
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      data: order,
    });
  } catch (error) {
    console.error('Error updating order:', error); // Log for debugging

    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the order.',
      error: error.message,
    });
  }
};

exports.deleteOrderByOrderInternalId = async (req, res) => {

  const { orderInternalId } = req.body;

  if (!orderInternalId) {
    return res.status(400).json({
      success: false,
      message: 'Order key is required to delete the order.',
    });
  }

  try {
    const order = await Order.findById(orderInternalId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    await order.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the order.',
      error: error.message,
    });
  }
};






